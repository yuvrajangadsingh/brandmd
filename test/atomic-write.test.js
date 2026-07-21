// Atomic-write harness for brandmd v0.14 (F-26).
//
// Locks: a failed write must never damage what was already on disk, in any
// write path. improvement-plan.md P0 item 9 ("atomic writes via temp+rename"),
// codex audit F-26, and codex v0.14 grade blockers:
//   grade blocker 5   a rename-time failure on the LAST --agent wrapper must
//                     leave the FULL previous pack intact (DESIGN.md + Cursor
//                     rule + .agents skill), leave no *.tmp litter, and a
//                     read-only target file must not be silently replaced
//   grade blocker 7   `brandmd diff` output is atomic too: a failed write
//                     must not destroy the existing diff file
//   re-grade N1-N4    pre-existing .bak files survive; duplicate targets never
//                     lose content; symlink targets keep link semantics or the
//                     write refuses; mid-commit failure restores every target
//
// Failure simulations (all offline via the BRANDMD_RAW_FILE seam):
//   - staging failure:  chmod 000 on a wrapper's parent dir (pre-rename)
//   - rename failure:   a DIRECTORY squatting on the final target path
//   - read-only target: chmod 444 on an existing artifact
//   - unwritable dir:   chmod 555 on the diff output's parent dir

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  chmodSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  existsSync,
  symlinkSync,
  lstatSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyze } from "../src/analyze.js";
import { generate } from "../src/generate.js";

const here = dirname(fileURLToPath(import.meta.url));
const BIN = join(here, "..", "bin", "brandmd.js");
const VALID_FIXTURE = join(here, "fixtures/raw-vercel.json");

// Offline seam: BRANDMD_RAW_FILE injects a raw-capture so the run reaches the
// write phase with no browser/network (see cli-contract.test.js for the full
// contract). The browser-less PLAYWRIGHT_BROWSERS_PATH makes any accidental
// live extraction fail instantly.
function runCLI(args, { cwd, rawFile, timeoutMs = 20000 } = {}) {
  const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "/nonexistent-brandmd-test" };
  if (rawFile) env.BRANDMD_RAW_FILE = rawFile;
  const res = spawnSync(process.execPath, [BIN, ...args], {
    cwd, env, encoding: "utf-8", timeout: timeoutMs,
  });
  const stdout = res.stdout || "";
  const stderr = res.stderr || "";
  return { status: res.status, stdout, stderr, out: stdout + stderr };
}

// Recursively list files whose basename looks like write-staging litter.
function tmpLitter(dir) {
  const found = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return; // unreadable (permission fixture dirs)
    }
    for (const e of entries) {
      const p = join(d, e.name);
      if (/\.tmp$/i.test(e.name)) found.push(p);
      if (e.isDirectory()) walk(p);
    }
  };
  walk(dir);
  return found;
}

const SENTINELS = {
  design: "# EXISTING GOOD DESIGN\n\nHand-maintained. Must survive a failed write.\n",
  cursor: "# EXISTING CURSOR RULE\n\nPrevious pack. Must survive a failed write.\n",
  agents: "# EXISTING AGENTS SKILL\n\nPrevious pack. Must survive a failed write.\n",
};

// Seed a full previous --agent pack (DESIGN.md + Cursor rule + .agents skill).
function seedPack(dir) {
  const designPath = join(dir, "DESIGN.md");
  const cursorPath = join(dir, ".cursor", "rules", "brand.mdc");
  const agentsPath = join(dir, ".agents", "skills", "brand-style", "SKILL.md");
  writeFileSync(designPath, SENTINELS.design);
  mkdirSync(dirname(cursorPath), { recursive: true });
  writeFileSync(cursorPath, SENTINELS.cursor);
  mkdirSync(dirname(agentsPath), { recursive: true });
  writeFileSync(agentsPath, SENTINELS.agents);
  return { designPath, cursorPath, agentsPath };
}

test("F-26: a failed --agent write leaves the existing DESIGN.md intact (staging failure)", () => {
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const designPath = join(dir, "DESIGN.md");
  writeFileSync(designPath, SENTINELS.design);

  // Make the last member of the --agent trio (.claude/skills/...) unwritable so
  // the pack write throws before its temp file can even be staged.
  const claudeDir = join(dir, ".claude");
  mkdirSync(claudeDir);
  chmodSync(claudeDir, 0o000);

  let r;
  try {
    r = runCLI(["https://vercel.com", "--agent", "-o", designPath], {
      cwd: dir,
      rawFile: VALID_FIXTURE,
    });
  } finally {
    chmodSync(claudeDir, 0o755); // restore so temp cleanup can proceed
  }

  assert.notEqual(r.status, 0, "the run must fail when a wrapper dir is unwritable");
  const after = readFileSync(designPath, "utf-8");
  assert.equal(after, SENTINELS.design, "the existing DESIGN.md must survive the failed write");

  // Discriminates the write-phase failure from a v0.13-style extraction failure.
  assert.doesNotMatch(
    r.out,
    /Executable doesn't exist|playwright|browserType|Extracting from/i,
    "the failure must come from the write phase, not live extraction"
  );
  assert.match(
    r.out,
    /EACCES|permission|not writable|unwritable|\.claude/i,
    "the failure must reference the unwritable wrapper target"
  );
});

test("blocker 5 (F-26): a rename-time failure leaves the FULL previous pack intact, no tmp litter", () => {
  // Codex's bypass of the staging-failure test: stage files write fine, but the
  // final rename of the LAST wrapper fails (a directory squats on the target
  // path). A transactional pack must roll back: DESIGN.md, the Cursor rule, and
  // the .agents skill all keep their previous contents, and no *.tmp files are
  // left anywhere in the tree.
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const { designPath, cursorPath, agentsPath } = seedPack(dir);

  // Directory where the .claude skill FILE must land -> rename fails, staging
  // succeeds.
  mkdirSync(join(dir, ".claude", "skills", "brand-style", "SKILL.md"), { recursive: true });

  const r = runCLI(["https://vercel.com", "--agent", "-o", designPath], {
    cwd: dir,
    rawFile: VALID_FIXTURE,
  });

  assert.notEqual(r.status, 0, "the run must fail when the last wrapper cannot be renamed in");
  assert.equal(
    readFileSync(designPath, "utf-8"),
    SENTINELS.design,
    "DESIGN.md must keep its previous content after a partial pack failure"
  );
  assert.equal(
    readFileSync(cursorPath, "utf-8"),
    SENTINELS.cursor,
    "the Cursor rule must keep its previous content (no mixed old/new pack)"
  );
  assert.equal(
    readFileSync(agentsPath, "utf-8"),
    SENTINELS.agents,
    "the .agents skill must keep its previous content (no mixed old/new pack)"
  );
  assert.deepEqual(tmpLitter(dir), [], "no staging *.tmp files may be left behind");
});

test("blocker 5 (F-26): a read-only target file is not silently replaced", () => {
  // Codex: rename bypasses the target's permission bits, so a 0444 artifact was
  // silently swapped and came back 0644. Respect the read-only bit: fail, and
  // leave content + mode untouched.
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const designPath = join(dir, "DESIGN.md");
  writeFileSync(designPath, SENTINELS.design);
  chmodSync(designPath, 0o444);

  let r;
  try {
    r = runCLI(["https://vercel.com", "-o", designPath], {
      cwd: dir,
      rawFile: VALID_FIXTURE,
    });
  } finally {
    chmodSync(designPath, 0o644); // restore for cleanup
    // re-assert content below reads post-restore; content unaffected by chmod
  }

  assert.notEqual(r.status, 0, "overwriting a read-only artifact must fail, not silently replace");
  assert.equal(
    readFileSync(designPath, "utf-8"),
    SENTINELS.design,
    "the read-only artifact must keep its previous content"
  );
});

test("blocker 5 (F-26): read-only target keeps its mode (no 444 -> 644 swap)", () => {
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const designPath = join(dir, "DESIGN.md");
  writeFileSync(designPath, SENTINELS.design);
  chmodSync(designPath, 0o444);

  runCLI(["https://vercel.com", "-o", designPath], { cwd: dir, rawFile: VALID_FIXTURE });

  const mode = statSync(designPath).mode & 0o777;
  try {
    assert.equal(
      mode,
      0o444,
      `the artifact's read-only mode must survive (got 0${mode.toString(8)})`
    );
  } finally {
    chmodSync(designPath, 0o644);
  }
});

test("blocker 5 (F-26): a failed non-agent write cleans up its temp file", () => {
  // A directory squatting on the css output path makes the final rename fail.
  // The staged temp file must be removed on the way out (codex found
  // `target.css.brandmd-<pid>.tmp` left behind).
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const outPath = join(dir, "theme.css");
  mkdirSync(outPath); // rename target is a directory -> EISDIR/ENOTEMPTY

  const r = runCLI(["https://vercel.com", "--css", "-o", outPath], {
    cwd: dir,
    rawFile: VALID_FIXTURE,
  });

  assert.notEqual(r.status, 0, "writing onto a directory must fail");
  assert.deepEqual(tmpLitter(dir), [], "the staged *.tmp file must be cleaned up on failure");
});

test("blocker 7 (F-26): a failed `brandmd diff` write never destroys the existing output", () => {
  // diff.js still writes with a bare writeFileSync. In a directory without
  // write permission, overwriting an EXISTING file succeeds (POSIX: only
  // create/delete need dir write), so the non-atomic path destroys the previous
  // diff even though a temp+rename path would fail cleanly and leave it alone.
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const aPath = join(dir, "a.md");
  const bPath = join(dir, "b.md");
  const outPath = join(dir, "BRAND_DIFF.md");
  const sentinel = "# EXISTING GOOD DIFF\n\nMust survive a failed diff write.\n";

  const md = generate(analyze(JSON.parse(readFileSync(VALID_FIXTURE, "utf-8"))));
  writeFileSync(aPath, md);
  writeFileSync(bPath, md);
  writeFileSync(outPath, sentinel);
  chmodSync(dir, 0o555); // no create/delete in dir; existing files stay writable

  let r;
  try {
    r = runCLI(["diff", aPath, bPath, "--out", outPath], { cwd: dir });
  } finally {
    chmodSync(dir, 0o755);
  }

  assert.equal(
    readFileSync(outPath, "utf-8"),
    sentinel,
    "the previous diff output must survive when the new one cannot be written atomically"
  );
  assert.notEqual(r.status, 0, "a diff that cannot write its output atomically must fail");
  assert.deepEqual(tmpLitter(dir), [], "no staging *.tmp files may be left behind");
});

// ---------------------------------------------------------------------------
// Codex re-grade round 2: new atomic-transaction findings (N1-N4).
// Unit-level against src/atomic-write.js (the shared write path every CLI
// format routes through). The injection points key off the module's current
// `.brandmd-<pid>.tmp` / `.brandmd-<pid>.bak` naming; these tests run
// in-process, so process.pid gives the exact paths.
// ---------------------------------------------------------------------------

let atomic = null;
try {
  atomic = await import("../src/atomic-write.js");
} catch {
  // Tests below fail with a clear message rather than the file erroring out.
}

function requireAtomicApi() {
  assert.ok(
    atomic && typeof atomic.writeAllAtomic === "function" && typeof atomic.writeFileAtomic === "function",
    "src/atomic-write.js must export writeAllAtomic/writeFileAtomic (the v0.14 transactional write path)"
  );
}

test("N1: a pre-existing backup-suffixed file survives a successful write untouched", () => {
  // Codex: the transaction uses `<target>.brandmd-<pid>.bak` as its backup slot
  // and both overwrites and deletes whatever already sits there. A user's file
  // that happens to carry that name must never be collateral damage.
  requireAtomicApi();
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const target = join(dir, "DESIGN.md");
  writeFileSync(target, "ORIGINAL");
  const planted = `${target}.brandmd-${process.pid}.bak`;
  const plantedContent = "USER BACKUP - do not touch";
  writeFileSync(planted, plantedContent);

  atomic.writeFileAtomic(target, "NEW");

  assert.equal(readFileSync(target, "utf-8"), "NEW", "the write itself must succeed");
  assert.ok(existsSync(planted), "the pre-existing .bak-named file must survive the write");
  assert.equal(
    readFileSync(planted, "utf-8"),
    plantedContent,
    "the pre-existing .bak-named file must be byte-identical afterwards"
  );
});

test("N2: duplicate target paths in one transaction never lose the original content", () => {
  // Codex: two entries for the same path share one temp slot; the second
  // commit's backup rename buries the original, the temp rename throws ENOENT,
  // and rollback leaves the target MISSING with the original gone. Contract:
  // either refuse duplicates upfront (original intact) or complete cleanly
  // (target holds one of the payloads); the path must never vanish.
  requireAtomicApi();
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const target = join(dir, "DESIGN.md");
  writeFileSync(target, "DUP-ORIGINAL");

  let threw = null;
  try {
    atomic.writeAllAtomic([
      { path: target, content: "FIRST" },
      { path: target, content: "SECOND" },
    ]);
  } catch (err) {
    threw = err;
  }

  assert.ok(existsSync(target), "the target file must never vanish");
  const after = readFileSync(target, "utf-8");
  if (threw) {
    assert.equal(
      after,
      "DUP-ORIGINAL",
      "a refused duplicate-target transaction must leave the original untouched"
    );
  } else {
    assert.ok(
      after === "FIRST" || after === "SECOND",
      `a completed transaction must land one of the payloads, got ${JSON.stringify(after)}`
    );
  }
  assert.deepEqual(
    readdirSync(dir).filter((n) => n !== "DESIGN.md"),
    [],
    "no temp or backup litter may be left beside the target"
  );
});

test("N3: a symlink target keeps its link semantics after a write (or the write refuses)", () => {
  // Codex: writing through a symlink replaced the link with a regular file and
  // left the referent stale — silently destroying link semantics. Acceptable
  // outcomes: write THROUGH the link (still a symlink, referent updated) or
  // refuse cleanly (still a symlink, referent untouched). Silent replacement is
  // never acceptable.
  requireAtomicApi();
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const referent = join(dir, "real.md");
  const link = join(dir, "DESIGN.md");
  writeFileSync(referent, "REAL-OLD");
  symlinkSync(referent, link);

  let threw = null;
  try {
    atomic.writeFileAtomic(link, "NEW");
  } catch (err) {
    threw = err;
  }

  assert.ok(
    lstatSync(link).isSymbolicLink(),
    "the target must still be a symlink after the write attempt"
  );
  if (threw) {
    assert.equal(
      readFileSync(referent, "utf-8"),
      "REAL-OLD",
      "a refused symlink write must leave the referent untouched"
    );
  } else {
    assert.equal(
      readFileSync(referent, "utf-8"),
      "NEW",
      "a successful symlink write must go through the link to the referent"
    );
  }
});

test("N4: after a mid-commit rename failure, every target is byte-intact (including the failing one)", () => {
  // Detonate the commit phase on the THIRD file by squatting a directory on its
  // backup slot: files one and two are already renamed in when the transaction
  // dies, so this locks rollback of committed members AND the failing member's
  // integrity. If a future implementation stops using this backup convention,
  // the transaction simply succeeds and the else-branch asserts the normal
  // all-new outcome — either way no file may be lost or half-written.
  requireAtomicApi();
  const dir = mkdtempSync(join(tmpdir(), "brandmd-atomic-"));
  const files = ["a.md", "b.md", "c.md"].map((n) => join(dir, n));
  const originals = ["ORIGINAL-A", "ORIGINAL-B", "ORIGINAL-C"];
  const fresh = ["NEW-A", "NEW-B", "NEW-C"];
  files.forEach((f, i) => writeFileSync(f, originals[i]));
  mkdirSync(`${files[2]}.brandmd-${process.pid}.bak`); // commit-phase landmine

  let threw = null;
  try {
    atomic.writeAllAtomic(files.map((f, i) => ({ path: f, content: fresh[i] })));
  } catch (err) {
    threw = err;
  }

  files.forEach((f, i) => {
    assert.ok(existsSync(f), `${f} must not vanish`);
    const got = readFileSync(f, "utf-8");
    if (threw) {
      assert.equal(
        got,
        originals[i],
        `a failed transaction must restore ${f} byte-intact (committed members rolled back, failing member untouched)`
      );
    } else {
      assert.equal(got, fresh[i], `a successful transaction must land the new content in ${f}`);
    }
  });
  assert.deepEqual(tmpLitter(dir), [], "no staging *.tmp files may be left behind");
});
