// examples/ must be exactly what the raw captures in test/captures produce with this code, so a
// change to analysis or generation shows its per-site effect in the same PR. Rebuild with
// `node scripts/examples.mjs replay`; a new capture comes from `node scripts/examples.mjs capture`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { replay } from "../scripts/examples.mjs";

const EXAMPLES = fileURLToPath(new URL("../examples/", import.meta.url));

test("examples/ is what test/captures replays to", () => {
  const dir = mkdtempSync(join(tmpdir(), "brandmd-replay-test-"));
  const files = replay(dir);
  assert.equal(files.length, 32);
  for (const f of files) assert.equal(readFileSync(join(dir, f), "utf8"), readFileSync(join(EXAMPLES, f), "utf8"), `examples/${f} is stale: run node scripts/examples.mjs replay`);
});
