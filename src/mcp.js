// MCP server over stdio with one tool that runs the brandmd CLI and returns
// its DESIGN.md. Spawning the CLI keeps every check it makes (URL validation,
// block and login-wall refusals, exit codes) and keeps its progress lines off
// this process's stdout, which carries the protocol.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/brandmd.js", import.meta.url));
const VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const TOOL = {
  name: "extract_design_md",
  description:
    "Render a website in headless Chromium and return its design system as a spec-valid DESIGN.md: colors, typography, spacing, radii and components, measured from the page. Several pages of one site merge into one design system. Refuses block pages, login walls and near-empty pages instead of guessing.",
  inputSchema: {
    type: "object",
    properties: {
      urls: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        description: 'One or more pages of the same site, e.g. ["https://stripe.com"] or ["linear.app", "linear.app/pricing"]',
      },
      dark: { type: "boolean", description: "Also extract the dark theme's tokens" },
    },
    required: ["urls"],
  },
};

// A call still running after this answers with a tool error and its CLI run
// is stopped, so a slow or endless site can't hold the client forever.
const timeout = Number(process.env.BRANDMD_MCP_TIMEOUT);
const TIMEOUT_S = timeout > 0 && timeout <= 86400 ? timeout : 180;

// Each call runs its own Chromium. Past this many at once, a call is refused
// with a tool error rather than queued.
const MAX_RUNNING = 2;

const children = new Set();
const calls = new Map(); // request id -> AbortController, for notifications/cancelled
const rpcError = (code, message) => Object.assign(new Error(message), { code });
const text = (t) => ({ type: "text", text: t });
const toolError = (t) => ({ isError: true, content: [text(t)] });

// SIGTERM makes Playwright close the browser. That close has no time limit,
// and a second SIGTERM makes Playwright SIGKILL the browser's own process
// group instead; a CLI still there after that is killed. On Windows kill()
// ends the CLI at once, so Playwright gets no chance to close the browser
// (untested). The child stays in `children` until it has exited.
function halt(child) {
  child.kill("SIGTERM");
  setTimeout(() => child.kill("SIGTERM"), 5000).unref();
  setTimeout(() => child.kill("SIGKILL"), 10000).unref();
}

function runCli(args, signal) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [BIN, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    children.add(child);
    const timer = setTimeout(() => (halt(child), done({ timedOut: true })), TIMEOUT_S * 1000);
    signal.addEventListener("abort", () => halt(child), { once: true });
    let out = "";
    let err = "";
    // setEncoding decodes across chunk boundaries; `+= buffer` would split
    // a multibyte character that lands on one.
    child.stdout.setEncoding("utf8").on("data", (d) => (out += d));
    child.stderr.setEncoding("utf8").on("data", (d) => (err += d));
    child.on("error", (e) => {
      if (child.pid === undefined) {
        // It never started, so no close will follow.
        clearTimeout(timer);
        children.delete(child);
      }
      done({ code: 1, out, err: `${err}${e.message}` });
    });
    child.on("close", (code) => (clearTimeout(timer), children.delete(child), done({ code, out, err })));
  });
}

async function extract(args, signal) {
  const { urls, dark } = args && typeof args === "object" ? args : {};
  if (!Array.isArray(urls) || !urls.length || !urls.every((u) => typeof u === "string" && u && !u.includes("\0"))) {
    return toolError("urls must be a non-empty array of URL strings");
  }
  if (dark !== undefined && typeof dark !== "boolean") return toolError("dark must be true or false");
  // URLs reach the CLI unchanged so it validates them as it would on the
  // command line. Only reject what argv would misread: a leading "-" is a
  // flag, and a bare word could name a subcommand. The CLI rejects bare words
  // anyway (not host-like), except localhost.
  const bad = urls.find((u) => u.startsWith("-") || (/^[a-z][a-z0-9-]*$/i.test(u) && u.toLowerCase() !== "localhost"));
  if (bad) return toolError(`"${bad}" is not a URL. Pass a page like https://example.com or example.com.`);
  if (children.size >= MAX_RUNNING) return toolError(`brandmd is already running ${MAX_RUNNING} extractions. Call again when one finishes.`);
  const { code, out, err, timedOut } = await runCli([...(dark ? ["--dark"] : []), ...urls], signal);
  if (timedOut) return toolError(`brandmd stopped after ${TIMEOUT_S}s without finishing. Try fewer pages, or leave out dark.`);
  if (code !== 0) return toolError(err.trim() || `brandmd exited with code ${code}`);
  const warnings = err.split("\n").filter((l) => /^Warning:/.test(l));
  return { content: [text(out), ...(warnings.length ? [text(warnings.join("\n"))] : [])] };
}

async function handle({ method, params }, version, signal) {
  switch (method) {
    case "initialize":
      return {
        protocolVersion: VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: "brandmd", version },
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: [TOOL] };
    case "tools/call":
      if (params?.name !== TOOL.name) throw rpcError(-32602, `Unknown tool: ${params?.name}`);
      return extract(params.arguments, signal);
    default:
      throw rpcError(-32601, `Method not found: ${method}`);
  }
}

const reply = (id, body) => ({ jsonrpc: "2.0", id, ...body });
const invalid = (id) => reply(id, { error: { code: -32600, message: "Invalid Request" } });

// One message in, one reply object out, or undefined when none is due
// (a notification, or a response from the client).
async function respond(msg, version) {
  if (msg === null || typeof msg !== "object" || Array.isArray(msg)) return invalid(null);
  if (!("method" in msg) && ("result" in msg || "error" in msg)) return undefined;
  // MCP request ids are strings or numbers, never null.
  const idOk = typeof msg.id === "string" || typeof msg.id === "number";
  if (msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return invalid(idOk ? msg.id : null);
  if (!("id" in msg)) {
    if (msg.method === "notifications/cancelled") calls.get(msg.params?.requestId)?.abort();
    return undefined;
  }
  if (!idOk) return invalid(null);
  const call = new AbortController();
  calls.set(msg.id, call);
  let body;
  try {
    body = { result: await handle(msg, version, call.signal) };
  } catch (e) {
    body = { error: { code: Number.isInteger(e.code) ? e.code : -32603, message: e.message } };
  } finally {
    if (calls.get(msg.id) === call) calls.delete(msg.id);
  }
  // MCP: a cancelled request gets no reply.
  return call.signal.aborted ? undefined : reply(msg.id, body);
}

export function serve(version) {
  const send = (body) => process.stdout.write(`${JSON.stringify(body)}\n`);
  // However the client goes away (stdin closed, stdout broken, a signal), no
  // CLI run, and no browser under it, outlives the server: each run is halted
  // like a cancelled one, and the server exits once all have exited (within
  // about 10 s, when the last SIGKILL lands).
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    for (const child of children) halt(child);
    setInterval(() => children.size || process.exit(0), 100);
  };
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, stop);
  process.stdout.on("error", stop);
  const input = createInterface({ input: process.stdin });
  input.on("close", stop);
  input.on("line", async (line) => {
    if (stopping || !line.trim()) return; // shutting down: start nothing new
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    }
    if (!Array.isArray(msg)) {
      const out = await respond(msg, version);
      return out && send(out);
    }
    // Batches (2025-03-26): reply with an array, or nothing if all were notifications.
    if (!msg.length) return send(invalid(null));
    const outs = (await Promise.all(msg.map((m) => respond(m, version)))).filter(Boolean);
    if (outs.length) send(outs);
  });
}
