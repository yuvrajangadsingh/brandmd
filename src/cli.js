import { Command } from "commander";
import { extractFromUrls } from "./extract.js";
import { analyze } from "./analyze.js";
import { generate } from "./generate.js";
import { generateCSS } from "./generate-css.js";
import { generateTailwind } from "./generate-tailwind.js";
import { generateHTML } from "./generate-html.js";
import { extractVision } from "./extract-vision.js";
import { generateAgentPack } from "./generate-agent.js";
import { writeFileSync } from "fs";
import { basename, dirname, isAbsolute, relative, resolve } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
  .name("brandmd")
  .description("Extract any website's design system into a DESIGN.md file")
  .version(pkg.version)
  .argument("<urls...>", "URLs to extract from (multiple URLs merge tokens)")
  .option("-o, --output <file>", "write to file instead of stdout")
  .option("--json", "output raw tokens as JSON")
  .option("--css", "output CSS custom properties")
  .option("--tailwind", "output Tailwind v4 @theme CSS")
  .option("--html", "output HTML brand guide")
  .option("--dark", "also extract dark mode tokens")
  .option("--vision", "use Gemini vision to capture illustration style, photography mood, copywriting voice, microcopy patterns. Requires GEMINI_API_KEY or GOOGLE_API_KEY env var (free tier: aistudio.google.com/apikey).")
  .option("--agent", "also write .cursor/rules/brand.mdc and .claude/skills/brand-style/SKILL.md alongside DESIGN.md so Claude Code and Cursor pick up the brand context automatically")
  .option("--cf-wait-ms <ms>", "max ms to wait for a Cloudflare challenge to auto-resolve (default 20000)", (v) => parseInt(v, 10), 20000)
  .action(async (urls, opts) => {
    // Normalize URLs
    urls = urls.map((u) => {
      if (!/^https?:\/\//i.test(u)) u = "https://" + u;
      try {
        new URL(u);
        return u;
      } catch {
        console.error(`Invalid URL: ${u}`);
        process.exit(1);
      }
    });

    // Warn if mixing domains
    const hosts = new Set(urls.map((u) => new URL(u).hostname));
    if (hosts.size > 1) {
      process.stderr.write(
        `Warning: extracting from ${hosts.size} different domains. Results may be inconsistent.\n`
      );
    }

    // Reject conflicting format flags
    const formats = [opts.json, opts.css, opts.tailwind, opts.html].filter(Boolean);
    if (formats.length > 1) {
      console.error("Error: only one output format flag allowed (--json, --css, --tailwind, --html)");
      process.exit(1);
    }

    // Skip dark mode extraction for non-DESIGN.md formats
    if (opts.dark && (opts.css || opts.tailwind || opts.html)) {
      process.stderr.write("Note: --dark only affects DESIGN.md output. Skipping dark extraction.\n");
      opts.dark = false;
    }

    // Vision is only embedded in the DESIGN.md output. Other formats stay token-only.
    if (opts.vision && (opts.json || opts.css || opts.tailwind || opts.html)) {
      process.stderr.write("Note: --vision only affects DESIGN.md output. Skipping vision call.\n");
      opts.vision = false;
    }

    // --agent writes wrapper files alongside DESIGN.md. It's a no-op for other formats.
    if (opts.agent && (opts.json || opts.css || opts.tailwind || opts.html)) {
      process.stderr.write("Note: --agent only works with DESIGN.md output. Skipping agent pack.\n");
      opts.agent = false;
    }

    // Validate vision key upfront so users don't pay for the Playwright run before failing.
    const visionApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (opts.vision && !visionApiKey) {
      console.error("Error: --vision requires GEMINI_API_KEY or GOOGLE_API_KEY env var.");
      console.error("Get a free key: https://aistudio.google.com/apikey");
      process.exit(1);
    }

    try {
      const label = urls.length > 1 ? `${urls.length} pages` : urls[0];
      process.stderr.write(`Extracting from ${label}...\n`);
      const { light, dark } = await extractFromUrls(urls, { dark: opts.dark, vision: opts.vision, cfWaitMs: opts.cfWaitMs });

      process.stderr.write("Analyzing design tokens...\n");
      const tokens = analyze(light);
      if (light.sources) tokens.sources = light.sources;

      let darkTokens = null;
      if (dark) {
        darkTokens = analyze(dark);
        tokens.dark = darkTokens;
      }

      // Vision call after CSS analysis. CSS-only fallback on API failure so users still get DESIGN.md.
      if (opts.vision && light.vision) {
        process.stderr.write("Calling Gemini vision API. Est. cost: free tier (~$0 if under quota)...\n");
        try {
          const pageText = [
            ...(light.vision.toneSnippets.h1 || []).map((s) => `H1: ${s}`),
            ...(light.vision.toneSnippets.h2 || []).map((s) => `H2: ${s}`),
            ...(light.vision.toneSnippets.hero_text || []).map((s) => `HERO: ${s}`),
            ...(light.vision.toneSnippets.buttons || []).map((s) => `BTN: ${s}`),
          ].join("\n").slice(0, 4000);

          const visionResult = await extractVision({
            screenshotBase64: light.vision.screenshotBase64,
            pageText,
            apiKey: visionApiKey,
          });
          tokens.vision = visionResult;
        } catch (err) {
          process.stderr.write(`Warning: vision extraction failed (${err.message}). Continuing CSS-only.\n`);
        }
      }

      if (opts.json) {
        const output = JSON.stringify(tokens, null, 2);
        if (opts.output) {
          writeFileSync(opts.output, output);
          process.stderr.write(`Tokens saved to ${opts.output}\n`);
        } else {
          console.log(output);
        }
        return;
      }

      if (opts.css) {
        const output = generateCSS(tokens);
        if (opts.output) {
          writeFileSync(opts.output, output);
          process.stderr.write(`CSS saved to ${opts.output}\n`);
        } else {
          console.log(output);
        }
        return;
      }

      if (opts.tailwind) {
        const output = generateTailwind(tokens);
        if (opts.output) {
          writeFileSync(opts.output, output);
          process.stderr.write(`Tailwind CSS saved to ${opts.output}\n`);
        } else {
          console.log(output);
        }
        return;
      }

      if (opts.html) {
        const output = generateHTML(tokens);
        const file = opts.output || "brand-guide.html";
        writeFileSync(file, output);
        process.stderr.write(`Brand guide saved to ${file}\n`);
        return;
      }

      process.stderr.write("Generating DESIGN.md...\n");
      const md = generate(tokens);

      if (opts.output) {
        writeFileSync(opts.output, md);
        process.stderr.write(`DESIGN.md saved to ${opts.output}\n`);
      } else if (opts.agent) {
        // --agent without -o needs DESIGN.md on disk so the wrappers can reference it.
        writeFileSync("DESIGN.md", md);
        process.stderr.write(`DESIGN.md saved to DESIGN.md\n`);
      } else {
        console.log(md);
      }

      if (opts.agent) {
        // Resolve the project root: -o points at a file, the root is its parent dir.
        // No -o: cwd. The DESIGN.md filename inside the rule/skill stays relative.
        const designOnDisk = opts.output || "DESIGN.md";
        const absDesign = isAbsolute(designOnDisk) ? designOnDisk : resolve(designOnDisk);
        const projectRoot = dirname(absDesign);
        const designRelToRoot = basename(absDesign);

        const written = generateAgentPack(projectRoot, designRelToRoot);
        for (const p of written) {
          const display = relative(process.cwd(), p) || p;
          process.stderr.write(`Wrote ${display}\n`);
        }
      }

      if (process.stderr.isTTY) {
        process.stderr.write('\n\u2605 If this saved you time, star the repo: https://github.com/yuvrajangadsingh/brandmd\n');
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
