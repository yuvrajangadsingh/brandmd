import { writeFileSync, renameSync, unlinkSync, existsSync, accessSync, mkdirSync, statSync, lstatSync, realpathSync, constants } from "fs";
import { dirname, resolve } from "path";
import { randomBytes } from "crypto";

/**
 * Transactional multi-file write (F-26).
 *
 * Phases:
 *   1. preflight  — create target dirs; resolve symlink targets to their real
 *                   path so the write goes THROUGH the link (link semantics are
 *                   preserved; a broken symlink is refused); refuse
 *                   directories-at-target, read-only existing targets, and
 *                   duplicate target paths BEFORE anything is staged;
 *   2. stage      — write each payload to a collision-safe temp file beside its
 *                   target (cleaned up on any failure, including mid-write);
 *   3. commit     — move an existing target to a collision-safe .bak, rename
 *                   the temp in; on any failure roll back every touched item —
 *                   including the one that failed mid-flight — from its .bak;
 *   4. cleanup    — drop only the .bak files this call created, and only after
 *                   every rename succeeded.
 *
 * Temp and backup names carry the pid plus random bytes and are checked for
 * existence before use, so this process never replaces or deletes a file it
 * didn't create (a pre-existing *.bak sentinel or another process's staging
 * files survive untouched).
 *
 * Scope: atomic per process. Concurrent brandmd runs against the same output
 * directory are not coordinated; each run is individually all-or-none, but the
 * combined end state of overlapping runs is whichever renames landed last.
 *
 * @param {{path: string, content: string}[]} files
 */
export function writeAllAtomic(files) {
  const suffix = () => `${process.pid}-${randomBytes(4).toString("hex")}`;
  const freshName = (base, ext) => {
    let name;
    do {
      name = `${base}.brandmd-${suffix()}.${ext}`;
    } while (existsSync(name));
    return name;
  };

  // --- 1. preflight ---
  const targets = [];
  const seen = new Set();
  for (const f of files) {
    mkdirSync(dirname(f.path), { recursive: true });

    // Symlink target: write through the link so `DESIGN.md -> real.md` setups
    // keep working and the link itself is never clobbered into a regular file.
    let final = f.path;
    let lst = null;
    try { lst = lstatSync(final); } catch { /* target doesn't exist yet */ }
    if (lst?.isSymbolicLink()) {
      try {
        final = realpathSync(final);
      } catch {
        throw new Error(`refusing to write through a broken symlink at ${f.path}`);
      }
    }

    if (existsSync(final)) {
      if (statSync(final).isDirectory()) {
        throw new Error(`refusing to replace a directory at ${final}`);
      }
      accessSync(final, constants.W_OK); // throws EACCES on a read-only target
    }

    // Duplicate targets corrupt commit/rollback ordering; reject up front.
    // (Symlink resolution above also catches two paths aliasing one file.)
    const key = resolve(final);
    if (seen.has(key)) {
      throw new Error(`duplicate output path in one transaction: ${f.path}`);
    }
    seen.add(key);

    targets.push({ final, content: f.content });
  }

  // --- 2. stage ---
  const staged = [];
  for (const t of targets) {
    const tmp = freshName(t.final, "tmp");
    try {
      writeFileSync(tmp, t.content);
    } catch (err) {
      for (const name of [...staged.map((x) => x.tmp), tmp]) {
        try { unlinkSync(name); } catch { /* best effort */ }
      }
      throw err;
    }
    staged.push({ tmp, final: t.final });
  }

  // --- 3. commit ---
  // Each entry is recorded BEFORE its renames run, with movedAside/placed
  // flags, so a failure mid-item still rolls that item back (previously the
  // currently-failing item was missing from the committed list and its
  // original was lost).
  const journal = [];
  try {
    for (const s of staged) {
      const entry = { tmp: s.tmp, final: s.final, bak: null, movedAside: false, placed: false };
      journal.push(entry);
      if (existsSync(s.final)) {
        entry.bak = freshName(s.final, "bak");
        renameSync(s.final, entry.bak);
        entry.movedAside = true;
      }
      renameSync(s.tmp, s.final);
      entry.placed = true;
    }
  } catch (err) {
    for (const e of [...journal].reverse()) {
      try {
        if (e.placed) {
          unlinkSync(e.final);
          if (e.bak) renameSync(e.bak, e.final);
        } else if (e.movedAside) {
          // Failed between moving the original aside and placing the new file:
          // put the original back.
          renameSync(e.bak, e.final);
        }
      } catch { /* best effort */ }
    }
    for (const s of staged) {
      try { if (existsSync(s.tmp)) unlinkSync(s.tmp); } catch { /* best effort */ }
    }
    throw err;
  }

  // --- 4. cleanup (only backups this call created) ---
  for (const e of journal) {
    if (e.bak) {
      try { unlinkSync(e.bak); } catch { /* best effort */ }
    }
  }
}

/** Single-file atomic write with the same guarantees. */
export function writeFileAtomic(file, content) {
  writeAllAtomic([{ path: file, content }]);
}
