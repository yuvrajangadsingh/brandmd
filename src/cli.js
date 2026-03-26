import { Command } from "commander";
import { extractFromUrl } from "./extract.js";
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
  .argument("<url>", "URL of the website to extract from")
  .option("-o, --output <file>", "write to file instead of stdout")
  .option("--json", "output raw tokens as JSON")
  .option("--css", "output CSS custom properties")
  .option("--tailwind", "output Tailwind v4 @theme CSS")
  .option("--html", "output HTML brand guide")
  .action(async (url, opts) => {
    // Normalize URL
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      new URL(url);
    } catch {
      console.error(`Invalid URL: ${url}`);
      process.exit(1);
    }

    // Reject conflicting format flags
    const formats = [opts.json, opts.css, opts.tailwind, opts.html].filter(Boolean);
    if (formats.length > 1) {
      console.error("Error: only one output format flag allowed (--json, --css, --tailwind, --html)");
      process.exit(1);
    }

    try {
      process.stderr.write(`Extracting from ${url}...\n`);
      const raw = await extractFromUrl(url);

      process.stderr.write("Analyzing design tokens...\n");
      const tokens = analyze(raw);

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
