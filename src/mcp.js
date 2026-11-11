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

const children = new Set();
const rpcError = (code, message) => Object.assign(new Error(message), { code });
const text = (t) => ({ type: "text", text: t });
const toolError = (t) => ({ isError: true, content: [text(t)] });

function runCli(args) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [BIN, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    children.add(child);
    let out = "";
    let err = "";
    // setEncoding decodes across chunk boundaries; `+= buffer` would split
    // a multibyte character that lands on one.
    child.stdout.setEncoding("utf8").on("data", (d) => (out += d));
    child.stderr.setEncoding("utf8").on("data", (d) => (err += d));
    child.on("error", (e) => (children.delete(child), done({ code: 1, out, err: `${err}${e.message}` })));
    child.on("close", (code) => (children.delete(child), done({ code, out, err })));
  });
}

async function extract(args) {
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
  const { code, out, err } = await runCli([...(dark ? ["--dark"] : []), ...urls]);
  if (code !== 0) return toolError(err.trim() || `brandmd exited with code ${code}`);
  const warnings = err.split("\n").filter((l) => /^Warning:/.test(l));
  return { content: [text(out), ...(warnings.length ? [text(warnings.join("\n"))] : [])] };
}

async function handle({ method, params }, version) {
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
      return extract(params.arguments);
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
  if (!("id" in msg)) return undefined;
  if (!idOk) return invalid(null);
  try {
    return reply(msg.id, { result: await handle(msg, version) });
  } catch (e) {
    return reply(msg.id, { error: { code: Number.isInteger(e.code) ? e.code : -32603, message: e.message } });
  }
}

export function serve(version) {
  const send = (body) => process.stdout.write(`${JSON.stringify(body)}\n`);
  // However the client goes away (stdin closed, stdout broken, a signal), no
  // CLI run, and no browser under it, outlives the server.
  const stop = () => {
    for (const child of children) child.kill("SIGTERM");
    process.exit(0);
  };
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, stop);
  process.stdout.on("error", stop);
  const input = createInterface({ input: process.stdin });
  input.on("close", stop);
  input.on("line", async (line) => {
    if (!line.trim()) return;
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
