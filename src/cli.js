import { Command } from "commander";
import { extractFromUrls } from "./extract.js";
import { analyze } from "./analyze.js";
import { generate } from "./generate.js";
import { generateCSS } from "./generate-css.js";
import { generateTailwind } from "./generate-tailwind.js";
import { generateHTML } from "./generate-html.js";
import { writeFileSync } from "fs";
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

    try {
      const label = urls.length > 1 ? `${urls.length} pages` : urls[0];
      process.stderr.write(`Extracting from ${label}...\n`);
      const { light, dark } = await extractFromUrls(urls, { dark: opts.dark });

      process.stderr.write("Analyzing design tokens...\n");
      const tokens = analyze(light);
      if (light.sources) tokens.sources = light.sources;

      let darkTokens = null;
      if (dark) {
        darkTokens = analyze(dark);
        tokens.dark = darkTokens;
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
      } else {
        console.log(md);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
