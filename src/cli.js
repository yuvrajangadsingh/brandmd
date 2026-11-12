// vibecheck-disable no-console-pollution
// This file IS the CLI's output surface: the console calls below are the
// program printing its result, not debug logging left behind.
import { Command } from "commander";
import { extractFromUrls, detectBlockLikely, assessEvidence } from "./extract.js";
import { analyze } from "./analyze.js";
import { generate } from "./generate.js";
import { generateCSS } from "./generate-css.js";
import { generateTailwind } from "./generate-tailwind.js";
import { generateHTML } from "./generate-html.js";
import { planAgentPack } from "./generate-agent.js";
import { diffDesigns } from "./diff.js";
import { parseDesign } from "./parse-design.js";
import { compareDesigns, exitCodeFor, formatDrift, validateBaseline } from "./check.js";
import { writeAllAtomic, writeFileAtomic } from "./atomic-write.js";
import { serve } from "./mcp.js";
import { launchErrorLine } from "./launch-error.js";
import { readFileSync } from "fs";
import { basename, dirname, isAbsolute, relative, resolve } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

// Exit-code contract (locked by test/cli-contract.test.js):
//   0 = success, 1 = operational/validation error, 2 = refused (block /
//   insufficient evidence / redirect not accepted).
const EXIT_OK = 0;
const EXIT_ERROR = 1;
const EXIT_REFUSED = 2;

/**
 * Browser failures get a one-line remediation (launch-error.js) instead of
 * Playwright's banner; the raw dump stays behind --debug. Shared so `check`
 * and the extract path cannot drift apart on error handling.
 */
function reportError(err, { debug } = {}) {
  const msg = err && err.message ? err.message : String(err);
  const line = launchErrorLine(msg, require("playwright/package.json").version);
  console.error(line || `Error: ${msg}`);
  if (line && debug) console.error(msg);
}


/**
 * Parse --viewport WxH. Pinning the viewport matters more than it looks: it
 * decides which breakpoint renders, so an unpinned run can legitimately
 * produce a different design system on a different machine.
 */
function parseViewport(v) {
  if (!v) return null;
  const m = /^(\d{2,5})x(\d{2,5})$/.exec(String(v).trim());
  if (!m) throw new Error(`--viewport must look like 1440x900 (got "${v}")`);
  return { width: Number(m[1]), height: Number(m[2]) };
}

/**
 * URL validation (F-22), shared by extraction and `check`: reject non-HTTP(S)
 * schemes and path-like arguments; infer https:// only for genuinely
 * host-like inputs. /tmp/x must be an error, never https:///tmp/x.
 */
function normalizeUrl(u) {
  // "localhost:3000" is host:port, not a scheme; everything else with a
  // scheme prefix that isn't http(s) is rejected outright.
  const schemeMatch = u.match(/^([a-z][a-z0-9+.-]*):(.*)$/i);
  const hasScheme = !!schemeMatch && !/^\d/.test(schemeMatch[2]);
  if (hasScheme && !/^https?:\/\//i.test(u)) {
    throw new Error(`unsupported URL scheme in "${u}". brandmd only extracts http(s) URLs.`);
  }
  if (/^https?:\/\/\//i.test(u)) throw new Error(`invalid URL "${u}" (empty host).`);
  if (!hasScheme && /^[\/.~\\]/.test(u)) throw new Error(`"${u}" looks like a filesystem path, not a URL.`);
  const normalized = /^https?:\/\//i.test(u) ? u : "https://" + u;
  let host = "";
  try {
    host = new URL(normalized).hostname;
  } catch { /* invalid below */ }
  // Inferred-scheme inputs must be host-like: a dotted name or localhost.
  if (!host || (!hasScheme && host !== "localhost" && !host.includes("."))) {
    throw new Error(`invalid URL "${u}".`);
  }
  return normalized;
}

/** --cf-wait-ms must be an integer from 0 to 600000 (F-22); 0 means no wait. */
function parseCfWait(v) {
  const ms = Number(v);
  if (!Number.isInteger(ms) || ms < 0 || ms > 600000) {
    throw new Error(`--cf-wait-ms must be an integer between 0 and 600000 (got "${v}").`);
  }
  return ms;
}

/**
 * The fail-closed gate (F-11/F-13/F-21), one place for every capture: light
 * and dark, extraction and check. A block page, an evidence-thin page or a
 * login-wall landing on ANY page refuses the whole run. Returns why (null when
 * the capture is fine) and whether it was a block page, which marks a forced
 * artifact.
 */
function refusal(raw) {
  const pages = raw.provenance ? raw.provenance.pages || [raw.provenance] : [];
  const blocked = !!raw.blockLikely || detectBlockLikely({
    title: raw.title,
    bodyTextLength: raw.bodyTextLength,
    colors: raw.colors,
    fonts: raw.fonts,
  });
  if (blocked) {
    const where = pages.filter((pg) => pg.blockLikely).map((pg) => pg.finalUrl);
    return { blocked, why: `${where.length ? where.join(", ") : `"${raw.url}"`} looks like a block / access-denied page` };
  }
  const evidence = assessEvidence(raw);
  if (!evidence.ok) return { blocked, why: `insufficient evidence (${evidence.reasons.join("; ")})` };
  const login = pages.filter((pg) => pg.loginLike);
  if (login.length) {
    return { blocked, why: `the request landed on a login / sign-in wall (${login.map((pg) => pg.finalUrl).join(", ")})` };
  }
  return { blocked, why: null };
}

/**
 * Read capture flags from the subcommand OR the root program. Options after
 * `check` reach check (positional options, below); this fallback keeps
 * `brandmd --viewport 1440x900 check <url>` working too.
 */
function captureFrom(opts) {
  const root = typeof program !== "undefined" ? program.opts() : {};
  const pick = (k) => (opts[k] !== undefined ? opts[k] : root[k]);
  return {
    viewport: parseViewport(pick("viewport")),
    locale: pick("locale") || null,
    reducedMotion: !!pick("reducedMotion"),
  };
}

// Positional: an option after a subcommand belongs to it. Without this,
// commander hands an option declared on both the root and `check` to the
// root, so `check <url> --allow-blocked` was ignored and `--cf-wait-ms 5`
// left check on its 20000 default.
const program = new Command().enablePositionalOptions();

program
  .command("diff <a> <b>")
  .description("compare two DESIGN.md files, write the diff to a markdown file")
  .option("--out <file>", "output path for the diff markdown", "BRAND_DIFF.md")
  .action((a, b, opts) => {
    try {
      const result = diffDesigns(a, b, opts.out);
      process.stderr.write(`Wrote ${opts.out} (${result.sharedColors} shared colors, ${result.aOnly} only in ${result.aName}, ${result.bOnly} only in ${result.bName})\n`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(EXIT_ERROR);
    }
  });

program
  .command("mcp")
  .description("run as an MCP server over stdio, so Claude Code, Cursor and other agents can call brandmd")
  .action(() => serve(pkg.version));

program
  .command("check <url>")
  .description("compare a live page against a committed DESIGN.md and fail on drift (exit 3)")
  .requiredOption("--against <file>", "the committed DESIGN.md to check against")
  .option("--report <file>", "also write the drift as JSON (for CI annotations)")
  .option("--fail-on <level>", "major (default), any, or none", "major")
  .option("--allow-blocked", "compare even if the page looks blocked (default: refuse, exit 2)")
  .option("--cf-wait-ms <ms>", "max ms to wait for a Cloudflare challenge", "20000")
  .option("--debug", "print raw error details instead of a one-line remediation")
  .option("--viewport <WxH>", "pin the viewport, e.g. 1440x900 (default 1440x900)")
  .option("--locale <tag>", "pin the browser locale, e.g. en-US")
  .option("--reduced-motion", "request prefers-reduced-motion: reduce")
  .action(async (url, opts) => {
    if (!["major", "any", "none"].includes(opts.failOn)) {
      console.error(`Error: --fail-on must be major, any, or none (got "${opts.failOn}")`);
      process.exit(EXIT_ERROR);
    }
    // Validate the URL and flags before any work, the same way extraction
    // does. Doing it at the call site meant a bad --viewport was silently
    // ignored whenever extraction was short-circuited, which is the worst of
    // both worlds: no error, no effect.
    let capture, cfWaitMs;
    try {
      url = normalizeUrl(url);
      cfWaitMs = parseCfWait(opts.cfWaitMs);
      capture = captureFrom(opts);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(EXIT_ERROR);
    }
    let baseline;
    try {
      baseline = parseDesign(readFileSync(opts.against, "utf8"));
    } catch (err) {
      console.error(`Error: could not read ${opts.against}: ${err.message}`);
      process.exit(EXIT_ERROR);
    }
    // An empty or truncated spec parses fine and yields nothing to compare, so
    // every run would report "0 major" and pass. Fail closed instead: a gate
    // that silently stops gating is worse than no gate.
    const specOk = validateBaseline(baseline);
    if (!specOk.ok) {
      console.error(
        `Error: ${opts.against} has nothing to check against (${specOk.reasons.join("; ")}).`
      );
      console.error("Regenerate it with: brandmd <url> --output " + opts.against);
      process.exit(EXIT_ERROR);
    }

    let light;
    try {
      // Same offline seam as the extract path, so the drift contract can be
      // tested with no browser and no network.
      const rawFile = process.env.BRANDMD_RAW_FILE;
      if (rawFile) {
        process.stderr.write(
          `Note: BRANDMD_RAW_FILE is set; loading the raw capture at ${rawFile} instead of a live browser run.\n`
        );
        light = JSON.parse(readFileSync(rawFile, "utf-8"));
      } else {
        process.stderr.write(`Checking ${url} against ${opts.against}...\n`);
        const res = await extractFromUrls([url], {
          // No dark mode here: parseDesign has no dark token model, so there
          // is nothing to compare a dark capture against yet.
          dark: false,
          vision: false,
          cfWaitMs,
          capture,
        });
        light = res.light;
      }
    } catch (err) {
      // `brandmd --debug check <url>` puts it on the root.
      reportError(err, { debug: opts.debug || program.opts().debug });
      process.exit(EXIT_ERROR);
    }

    // Same fail-closed gate as extraction. Diffing a Cloudflare page against a
    // real spec would report every token as drift, which is worse than no
    // answer: it would train people to ignore the check. A login wall renders
    // someone else's design system, so it refuses too.
    const { why } = refusal(light);
    if (why && !opts.allowBlocked) {
      process.stderr.write(`Refusing to report drift: ${why}.\n`);
      process.stderr.write("That would look like total drift against your spec. Pass --allow-blocked to override.\n");
      process.exit(EXIT_REFUSED);
    }
    if (why) process.stderr.write(`Warning: comparing a refused source (--allow-blocked): ${why}.\n`);

    // Round-trip the live extraction through generate+parse so both sides are
    // the same shape, and so check can never disagree with what a written
    // DESIGN.md would have said.
    let result;
    try {
      result = compareDesigns(baseline, parseDesign(generate(analyze(light))));
    } catch (err) {
      reportError(err, { debug: opts.debug || program.opts().debug });
      process.exit(EXIT_ERROR);
    }

    // The JSON report is written first, so a failed write exits 1 with nothing
    // on stdout instead of a drift report followed by a crash.
    if (opts.report) {
      try {
        writeFileAtomic(
          opts.report,
          JSON.stringify({ url, spec: opts.against, ...result }, null, 2) + "\n"
        );
      } catch (err) {
        console.error(`Error: could not write ${opts.report}: ${err.message}`);
        process.exit(EXIT_ERROR);
      }
      process.stderr.write(`Wrote ${opts.report}\n`);
    }
    process.stdout.write(formatDrift(result, { url, specPath: opts.against }) + "\n");
    // exitCode, not exit(): stdout may still be draining into a pipe.
    process.exitCode = exitCodeFor(result, opts.failOn);
  });

program
  .name("brandmd")
  .description("Extract any website's design system into a spec-valid DESIGN.md file")
  .version(pkg.version)
  .argument("<urls...>", "URLs to extract from (multiple URLs merge tokens)")
  .option("-o, --output <file>", "write to file instead of stdout")
  .option("--json", "output raw tokens as JSON")
  .option("--css", "output CSS custom properties")
  .option("--tailwind", "output Tailwind v4 @theme CSS")
  .option("--html", "output HTML brand guide")
  .option("--dark", "also extract dark mode tokens")
  .option("--vision", "use Gemini vision to capture illustration style, photography mood, copywriting voice, microcopy patterns. Requires GEMINI_API_KEY or GOOGLE_API_KEY env var (free tier: aistudio.google.com/apikey).")
  .option("--agent", "also write .cursor/rules/brand.mdc and SKILL.md to both .agents/skills/brand-style/ (universal Agent Skills path) and .claude/skills/brand-style/ (backward-compat) alongside DESIGN.md so Claude Code, Cursor, Codex, Gemini CLI, Kiro CLI, and 50+ other agents pick up the brand context automatically")
  .option("--allow-blocked", "write an artifact even when the page looks like a block / access-denied page or has thin evidence (default: refuse with exit code 2)")
  .option("--debug", "print raw error details (e.g. full browser-launch output) instead of a one-line remediation")
  .option("--cf-wait-ms <ms>", "max ms to wait for a Cloudflare challenge to auto-resolve (default 20000)", "20000")
  .option("--viewport <WxH>", "pin the viewport, e.g. 1440x900 (default 1440x900)")
  .option("--locale <tag>", "pin the browser locale, e.g. en-US")
  .option("--reduced-motion", "request prefers-reduced-motion: reduce")
  .action(async (urls, opts) => {
    let cfWaitMs;
    try {
      urls = urls.map(normalizeUrl);
      cfWaitMs = parseCfWait(opts.cfWaitMs);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(EXIT_ERROR);
    }

    // Warn if mixing domains
    const hosts = new Set(urls.map((u) => new URL(u).hostname));
    if (hosts.size > 1) {
      process.stderr.write(`Warning: extracting from ${hosts.size} different domains. Results may be inconsistent.\n`);
    }

    // Reject conflicting format flags
    const formats = [opts.json, opts.css, opts.tailwind, opts.html].filter(Boolean);
    if (formats.length > 1) {
      console.error("Error: only one output format flag allowed (--json, --css, --tailwind, --html)");
      process.exit(EXIT_ERROR);
    }

    // Format-specific no-ops
    if (opts.dark && (opts.css || opts.tailwind || opts.html)) {
      process.stderr.write("Note: --dark only affects DESIGN.md output. Skipping dark extraction.\n");
      opts.dark = false;
    }
    if (opts.vision && (opts.json || opts.css || opts.tailwind || opts.html)) {
      process.stderr.write("Note: --vision only affects DESIGN.md output. Skipping vision call.\n");
      opts.vision = false;
    }
    if (opts.agent && (opts.json || opts.css || opts.tailwind || opts.html)) {
      process.stderr.write("Note: --agent only works with DESIGN.md output. Skipping agent pack.\n");
      opts.agent = false;
    }

    const visionApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (opts.vision && !visionApiKey) {
      console.error("Error: --vision requires GEMINI_API_KEY or GOOGLE_API_KEY env var.");
      console.error("Get a free key: https://aistudio.google.com/apikey");
      process.exit(EXIT_ERROR);
    }

    // A failed or missing vision step must not look like success: the CSS-only
    // DESIGN.md is still written (the extraction was real), but the run exits 1.
    let visionError = null;
    try {
      // --- Load the extraction. Offline test seam: BRANDMD_RAW_FILE injects a
      // raw capture and skips live extraction (no browser, no "Extracting"). ---
      let light;
      let dark = null;
      const rawFile = process.env.BRANDMD_RAW_FILE;
      if (rawFile) {
        process.stderr.write(`Note: BRANDMD_RAW_FILE is set; loading the raw capture at ${rawFile} instead of a live browser run.\n`);
        light = JSON.parse(readFileSync(rawFile, "utf-8"));
      } else {
        const label = urls.length > 1 ? `${urls.length} pages` : urls[0];
        process.stderr.write(`Extracting from ${label}...\n`);
        const res = await extractFromUrls(urls, { dark: opts.dark, vision: opts.vision, cfWaitMs, capture: captureFrom(opts) });
        light = res.light;
        dark = res.dark;
      }

      // --- Fail-closed gate (F-11/F-13/F-21): a block page, a login/redirect
      // landing, or an evidence-thin page refuses in EVERY format with a
      // distinct exit code, unless --allow-blocked overrides. The dark capture
      // goes through the same gate; it used to be analyzed unchecked. ---
      const lightGate = refusal(light);
      const darkGate = dark ? refusal(dark) : { blocked: false, why: null };
      const why = [lightGate.why, darkGate.why && `the dark capture: ${darkGate.why}`].filter(Boolean).join("; ");
      if (why && !opts.allowBlocked) {
        process.stderr.write(`Refusing to write an artifact: ${why}.\n`);
        process.stderr.write("Re-run against a real, non-protected page, or pass --allow-blocked to force output.\n");
        process.exit(EXIT_REFUSED);
      }
      if (why) {
        if (lightGate.blocked || darkGate.blocked) light.blockLikely = true;
        process.stderr.write("Warning: forcing output from a refused source (--allow-blocked).\n");
      }
      const prov = light.provenance;
      const crossPages = (prov ? prov.pages || [prov] : []).filter((pg) => pg.crossOrigin && !pg.loginLike);
      // Plain cross-origin redirects warn with provenance but don't refuse (a
      // legit apex->www or CDN redirect is normal); every page is checked.
      for (const pg of crossPages) {
        process.stderr.write(`Warning: ${pg.requestedUrl} landed on a different domain (${pg.finalUrl}). The tokens may describe that page, not the URL you asked for.\n`);
      }

      process.stderr.write("Analyzing design tokens...\n");
      const tokens = analyze(light);
      if (light.sources) tokens.sources = light.sources;
      if (dark) tokens.dark = analyze(dark);
      // Like a failed vision step: the light-only output is still written,
      // but asking for dark and getting none must not exit 0.
      if (opts.dark && !dark) {
        process.stderr.write("Error: --dark requested but no dark page was extracted. Writing the output without the dark section and exiting 1.\n");
        process.exitCode = EXIT_ERROR;
      }

      if (opts.vision && !light.vision) {
        visionError = "no screenshot captured";
        process.stderr.write("Error: --vision requested but no screenshot was captured. Writing DESIGN.md without the vision sections and exiting 1.\n");
      }
      if (opts.vision && light.vision) {
        process.stderr.write("Calling Gemini vision API. Est. cost: free tier (~$0 if under quota)...\n");
        try {
          const pageText = [
            ...(light.vision.toneSnippets.h1 || []).map((s) => `H1: ${s}`),
            ...(light.vision.toneSnippets.h2 || []).map((s) => `H2: ${s}`),
            ...(light.vision.toneSnippets.hero_text || []).map((s) => `HERO: ${s}`),
            ...(light.vision.toneSnippets.buttons || []).map((s) => `BTN: ${s}`),
          ].join("\n").slice(0, 4000);
          // Loaded here, not at the top: the Gemini SDK is ~14 MB and only --vision uses it.
          const { extractVision } = await import("./extract-vision.js");
          tokens.vision = await extractVision({
            screenshotBase64: light.vision.screenshotBase64,
            pageText,
            apiKey: visionApiKey,
          });
        } catch (err) {
          visionError = err.message;
          process.stderr.write(`Error: vision extraction failed (${err.message}). Writing DESIGN.md without the vision sections and exiting 1.\n`);
        }
      }

      // --- Non-DESIGN.md formats ---
      if (opts.json) return emit(JSON.stringify(tokens, null, 2), opts, "Tokens");
      if (opts.css) return emit(generateCSS(tokens), opts, "CSS");
      if (opts.tailwind) return emit(generateTailwind(tokens), opts, "Tailwind CSS");
      if (opts.html) {
        const file = opts.output || "brand-guide.html";
        writeFileAtomic(file, generateHTML(tokens));
        process.stderr.write(`Brand guide saved to ${file}\n`);
        return;
      }

      // --- DESIGN.md (default) ---
      process.stderr.write("Generating DESIGN.md...\n");
      const md = generate(tokens);

      if (opts.agent) {
        // DESIGN.md and the three wrappers commit as ONE transaction: either
        // all four land or none do, and previous versions survive any partial
        // failure (F-26).
        const designOnDisk = opts.output || "DESIGN.md";
        const absDesign = isAbsolute(designOnDisk) ? designOnDisk : resolve(designOnDisk);
        const pack = planAgentPack(dirname(absDesign), basename(absDesign));
        writeAllAtomic([{ path: absDesign, content: md }, ...pack]);
        process.stderr.write(`DESIGN.md saved to ${designOnDisk}\n`);
        for (const f of pack) {
          process.stderr.write(`Wrote ${relative(process.cwd(), f.path) || f.path}\n`);
        }
      } else if (opts.output) {
        writeFileAtomic(opts.output, md);
        process.stderr.write(`DESIGN.md saved to ${opts.output}\n`);
      } else {
        console.log(md);
      }

      if (process.stderr.isTTY) {
        process.stderr.write('\n★ If this saved you time, star the repo: https://github.com/yuvrajangadsingh/brandmd\n  More tools by the author: https://yuvrajangadsingh.com\n');
      }
      // exitCode, not exit(): stdout may still be draining into a pipe.
      if (visionError) process.exitCode = EXIT_ERROR;
    } catch (err) {
      reportError(err, { debug: opts.debug });
      process.exit(EXIT_ERROR);
    }

    function emit(output, opts, label) {
      if (opts.output) {
        writeFileAtomic(opts.output, output);
        process.stderr.write(`${label} saved to ${opts.output}\n`);
      } else {
        console.log(output);
      }
    }
  });

program.parse();
