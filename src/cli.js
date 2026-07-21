import { Command } from "commander";
import { extractFromUrls, detectBlockLikely, assessEvidence } from "./extract.js";
import { analyze } from "./analyze.js";
import { generate } from "./generate.js";
import { generateCSS } from "./generate-css.js";
import { generateTailwind } from "./generate-tailwind.js";
import { generateHTML } from "./generate-html.js";
import { extractVision } from "./extract-vision.js";
import { planAgentPack } from "./generate-agent.js";
import { diffDesigns } from "./diff.js";
import { writeAllAtomic, writeFileAtomic } from "./atomic-write.js";
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

const program = new Command();

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
  .action(async (urls, opts) => {
    // --- URL validation (F-22): reject non-HTTP(S) schemes and path-like
    // arguments; infer https:// only for genuinely host-like inputs. /tmp/x
    // must be an error, never https:///tmp/x. ---
    urls = urls.map((u) => {
      // "localhost:3000" is host:port, not a scheme; everything else with a
      // scheme prefix that isn't http(s) is rejected outright.
      const schemeMatch = u.match(/^([a-z][a-z0-9+.-]*):(.*)$/i);
      const hasScheme = !!schemeMatch && !/^\d/.test(schemeMatch[2]);
      if (hasScheme && !/^https?:\/\//i.test(u)) {
        console.error(`Error: unsupported URL scheme in "${u}". brandmd only extracts http(s) URLs.`);
        process.exit(EXIT_ERROR);
      }
      if (/^https?:\/\/\//i.test(u)) {
        console.error(`Error: invalid URL "${u}" (empty host).`);
        process.exit(EXIT_ERROR);
      }
      if (!hasScheme) {
        // Filesystem-like inputs are not URLs.
        if (/^[\/.~\\]/.test(u)) {
          console.error(`Error: "${u}" looks like a filesystem path, not a URL.`);
          process.exit(EXIT_ERROR);
        }
      }
      const normalized = /^https?:\/\//i.test(u) ? u : "https://" + u;
      try {
        const parsed = new URL(normalized);
        if (!parsed.hostname) throw new Error("no host");
        // Inferred-scheme inputs must be host-like: a dotted name or localhost.
        if (!hasScheme && parsed.hostname !== "localhost" && !parsed.hostname.includes(".")) {
          throw new Error("not host-like");
        }
        return normalized;
      } catch {
        console.error(`Error: invalid URL "${u}".`);
        process.exit(EXIT_ERROR);
      }
    });

    // --- --cf-wait-ms must be a finite, non-negative integer (F-22). ---
    const cfWaitMs = Number(opts.cfWaitMs);
    if (!Number.isFinite(cfWaitMs) || !Number.isInteger(cfWaitMs) || cfWaitMs < 0 || cfWaitMs > 600000) {
      console.error(`Error: --cf-wait-ms must be an integer between 0 and 600000 (got "${opts.cfWaitMs}").`);
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
        const res = await extractFromUrls(urls, { dark: opts.dark, vision: opts.vision, cfWaitMs });
        light = res.light;
        dark = res.dark;
      }

      // --- Fail-closed gate (F-11/F-13/F-21): a block page, a login/redirect
      // landing, or an evidence-thin page refuses in EVERY format with a
      // distinct exit code, unless --allow-blocked overrides. ---
      const blocked = !!light.blockLikely || detectBlockLikely({
        title: light.title,
        bodyTextLength: light.bodyTextLength,
        colors: light.colors,
        fonts: light.fonts,
      });
      const evidence = assessEvidence(light);
      const prov = light.provenance;
      const provPages = prov ? (prov.pages || [prov]) : [];
      const loginPages = provPages.filter((pg) => pg.loginLike);
      const crossPages = provPages.filter((pg) => pg.crossOrigin && !pg.loginLike);

      // Refuse (exit 2): block pages, evidence-thin pages, and login/sign-in
      // wall landings on ANY page. A login wall means the extracted tokens
      // describe an identity provider, not the brand. --allow-blocked overrides.
      if (!opts.allowBlocked && (blocked || !evidence.ok || loginPages.length)) {
        let why;
        if (blocked) why = `"${urls[0]}" looks like a block / access-denied page`;
        else if (!evidence.ok) why = `insufficient evidence (${evidence.reasons.join("; ")})`;
        else why = `the request landed on a login / sign-in wall (${loginPages.map((pg) => pg.finalUrl).join(", ")})`;
        process.stderr.write(`Refusing to write an artifact: ${why}.\n`);
        process.stderr.write("Re-run against a real, non-protected page, or pass --allow-blocked to force output.\n");
        process.exit(EXIT_REFUSED);
      }
      if (opts.allowBlocked && (blocked || loginPages.length || !evidence.ok)) {
        if (blocked) light.blockLikely = true;
        process.stderr.write("Warning: forcing output from a refused source (--allow-blocked).\n");
      }
      // Plain cross-origin redirects warn with provenance but don't refuse (a
      // legit apex->www or CDN redirect is normal); every page is checked.
      for (const pg of crossPages) {
        process.stderr.write(`Warning: ${pg.requestedUrl} landed on a different domain (${pg.finalUrl}). The tokens may describe that page, not the URL you asked for.\n`);
      }

      process.stderr.write("Analyzing design tokens...\n");
      const tokens = analyze(light);
      if (light.sources) tokens.sources = light.sources;
      if (dark) tokens.dark = analyze(dark);

      if (opts.vision && light.vision) {
        process.stderr.write("Calling Gemini vision API. Est. cost: free tier (~$0 if under quota)...\n");
        try {
          const pageText = [
            ...(light.vision.toneSnippets.h1 || []).map((s) => `H1: ${s}`),
            ...(light.vision.toneSnippets.h2 || []).map((s) => `H2: ${s}`),
            ...(light.vision.toneSnippets.hero_text || []).map((s) => `HERO: ${s}`),
            ...(light.vision.toneSnippets.buttons || []).map((s) => `BTN: ${s}`),
          ].join("\n").slice(0, 4000);
          tokens.vision = await extractVision({
            screenshotBase64: light.vision.screenshotBase64,
            pageText,
            apiKey: visionApiKey,
          });
        } catch (err) {
          process.stderr.write(`Warning: vision extraction failed (${err.message}). Continuing CSS-only.\n`);
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
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      // Classify browser-launch failures into a one-line remediation (F-27);
      // the raw dump stays behind --debug.
      if (/Executable doesn't exist|playwright install|browserType\.launch|Failed to launch|Target page, context or browser has been closed/i.test(msg)) {
        console.error("Error: could not launch the headless browser. Install it with: npx playwright install chromium");
        if (opts.debug) console.error(msg);
      } else {
        console.error(`Error: ${msg}`);
      }
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
