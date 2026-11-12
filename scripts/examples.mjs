#!/usr/bin/env node
// Capture once, replay per revision.
//   node scripts/examples.mjs capture [name...]   live browser: test/captures/<name>.json per example site
//   node scripts/examples.mjs replay              no network: rebuild examples/ from those captures
// A change to analysis or generation then shows up as an exact per-site diff in examples/, with no
// site drift mixed in (test/examples-replay.test.js fails until examples/ is rebuilt). A change to
// extraction itself needs a fresh capture.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CAPTURES = join(ROOT, "test", "captures");
// the sites as examples/README.md lists them: "- [Name](file.md) · host"
const SITES = [...readFileSync(join(ROOT, "examples", "README.md"), "utf8").matchAll(/^- \[[^\]]+\]\(([\w-]+)\.md\) · (\S+)$/gm)]
  .map(([, name, host]) => ({ name, url: `https://${host}` }));

const PREAMBLE = (url) => `> This is a real \`DESIGN.md\` example generated from [${url}](${url}) with \`npx brandmd\`.
>
> Drop a \`DESIGN.md\` like this in your project root so Claude Code, Cursor, Gemini CLI, Codex, or Google Stitch can use the colors, typography, spacing, and UI patterns when generating UI.
>
> Generate one for your site: \`npx brandmd https://yoursite.com\` ([npm](https://www.npmjs.com/package/brandmd) · [repo](https://github.com/yuvrajangadsingh/brandmd))

`;

function brandmd(args, rawFile) {
  const env = { ...process.env };
  delete env.BRANDMD_RAW_FILE;
  if (rawFile) env.BRANDMD_RAW_FILE = rawFile;
  const r = spawnSync(process.execPath, [join(ROOT, "bin", "brandmd.js"), ...args], { cwd: ROOT, env, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`brandmd ${args.join(" ")} exited ${r.status}\n${r.stderr}`);
  return r.stdout.replace(/\n$/, ""); // console.log's newline; -o writes without it, as examples/ always has
}

// Builds every capture-derived file of examples/ into `dir`; returns their names.
export function replay(dir) {
  const raw = (name) => join(CAPTURES, `${name}.json`);
  const out = {};
  for (const { name, url } of SITES) {
    const md = brandmd([url], raw(name));
    const end = md.indexOf("\n---\n", 4) + 5; // after the YAML front matter
    out[`${name}.md`] = md.slice(0, end) + "\n" + PREAMBLE(url) + md.slice(end);
  }
  out["vercel.css"] = brandmd(["https://vercel.com", "--css"], raw("vercel"));
  out["linear-tailwind.css"] = brandmd(["https://linear.app", "--tailwind"], raw("linear"));
  for (const [file, text] of Object.entries(out)) writeFileSync(join(dir, file), text);
  // diff names its inputs by basename, so it runs on the files just built
  brandmd(["diff", join(dir, "stripe.md"), join(dir, "vercel.md"), "--out", join(dir, "diff-stripe-vs-vercel.md")]);
  return [...Object.keys(out), "diff-stripe-vs-vercel.md"];
}

async function capture(names) {
  const unknown = names.filter((n) => !SITES.some((s) => s.name === n));
  if (unknown.length) throw new Error(`not in examples/README.md: ${unknown.join(", ")}`);
  const { extractFromUrls } = await import("../src/extract.js");
  mkdirSync(CAPTURES, { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), "brandmd-capture-"));
  for (const { name, url } of SITES.filter((s) => !names.length || names.includes(s.name))) {
    try {
      const { light } = await extractFromUrls([url]);
      // a block page or login wall comes back as data; the CLI refuses it (exit 2), so only a
      // capture the CLI accepts replaces the one in test/captures
      const file = join(tmp, `${name}.json`);
      writeFileSync(file, JSON.stringify(light) + "\n");
      brandmd([url], file);
      copyFileSync(file, join(CAPTURES, `${name}.json`));
      console.error(`captured ${name}`);
    } catch (err) {
      console.error(`FAILED ${name}: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...names] = process.argv.slice(2);
  if (cmd === "capture") await capture(names);
  else if (cmd === "replay") {
    const dir = mkdtempSync(join(tmpdir(), "brandmd-replay-"));
    const files = replay(dir);
    for (const f of files) copyFileSync(join(dir, f), join(ROOT, "examples", f));
    console.error(`rebuilt ${files.length} files in examples/`);
  } else {
    console.error("usage: node scripts/examples.mjs capture [name...] | replay");
    process.exitCode = 2;
  }
}
