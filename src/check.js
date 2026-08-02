/**
 * Compare a live extraction against a committed DESIGN.md.
 *
 * `brandmd diff` answers "how do these two brands differ". This answers a
 * different question: "has the thing we shipped drifted from the spec we
 * agreed on". That makes it a CI assertion rather than a research tool, so it
 * returns structured drift plus an exit code instead of prose.
 *
 * Both sides are parseDesign() output, so the live side is generated to
 * markdown and re-parsed before comparison. Round-tripping through the same
 * parser is deliberate: it guarantees the two sides are shaped identically and
 * that check can never disagree with what the file actually says.
 */

const SEVERITY_ORDER = { major: 2, minor: 1 };

const norm = (s) => (typeof s === "string" ? s.trim().toLowerCase() : s);

/** #fff and #FFFFFF are the same colour; compare them as such. */
const hex = (s) => {
  if (typeof s !== "string") return s;
  const v = s.trim().toUpperCase();
  const m = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/.exec(v);
  return m ? `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}` : v;
};

/**
 * A CI gate must never fail open. An empty or truncated DESIGN.md parses
 * without throwing and yields no roles, which would make every run report
 * "0 major" and exit 0 forever — the check would look healthy while
 * protecting nothing. Callers refuse rather than compare.
 */
export function validateBaseline(design) {
  const reasons = [];
  const roles = (design?.colors || []).filter((c) => c.role || c.name).length;
  const hasType = !!(design?.typography?.primaryFont);
  if (!roles) reasons.push("no colour roles");
  if (!hasType) reasons.push("no primary font");
  return { ok: roles > 0 && hasType, reasons };
}

function drift(severity, kind, message, extra = {}) {
  return { severity, kind, message, ...extra };
}

/**
 * Fonts are the loudest possible drift: if the primary typeface changed, the
 * page does not look like the brand any more, whatever else matches.
 */
function compareTypography(base, cur) {
  const out = [];
  const bt = base.typography || {};
  const ct = cur.typography || {};

  for (const field of ["primaryFont", "secondaryFont"]) {
    const b = bt[field];
    const c = ct[field];
    if (b && c && norm(b) !== norm(c)) {
      out.push(
        drift("major", "typography", `${field} changed: ${b} -> ${c}`, {
          field,
          baseline: b,
          current: c,
        })
      );
    } else if (b && !c) {
      out.push(
        drift("major", "typography", `${field} missing from live page (spec: ${b})`, {
          field,
          baseline: b,
          current: null,
        })
      );
    }
  }

  for (const field of ["headingScale", "bodyScale", "weights"]) {
    const b = bt[field] || [];
    const c = ct[field] || [];
    const missing = b.filter((v) => !c.includes(v));
    const added = c.filter((v) => !b.includes(v));
    if (missing.length) {
      out.push(
        drift("minor", "typography", `${field}: ${missing.join(", ")} no longer present`, {
          field,
          missing,
        })
      );
    }
    if (added.length) {
      out.push(
        drift("minor", "typography", `${field}: ${added.join(", ")} not in spec`, {
          field,
          added,
        })
      );
    }
  }
  return out;
}

/**
 * Colours are compared BY ROLE, not as a flat set of hexes.
 *
 * The spec uses Material-style role tokens, and one hex legitimately fills
 * several roles: in examples/stripe.md #FFFFFF is background, on-primary and
 * on-secondary at once. A set comparison would therefore miss the drift that
 * actually matters (the hex behind `primary` changing) whenever that hex still
 * appears somewhere else in the palette.
 *
 * Losing or repainting a role is major. A new role appearing is minor: that is
 * usually a new component landing, which is normal on a feature branch.
 */
function compareColors(base, cur) {
  const out = [];
  const byRole = (list) => {
    const m = new Map();
    for (const c of list || []) {
      const key = norm(c.role) || norm(c.name);
      if (!key) continue;
      if (!m.has(key)) m.set(key, { ...c, hex: hex(c.hex) });
    }
    return m;
  };
  const b = byRole(base.colors);
  const c = byRole(cur.colors);

  for (const [role, col] of b) {
    const live = c.get(role);
    if (!live) {
      out.push(
        drift("major", "color", `role "${role}" (${col.hex}) in spec but not on the page`, {
          role,
          baseline: col.hex,
          current: null,
        })
      );
    } else if (live.hex !== col.hex) {
      out.push(
        drift("major", "color", `role "${role}" repainted: ${col.hex} -> ${live.hex}`, {
          role,
          baseline: col.hex,
          current: live.hex,
        })
      );
    }
  }
  for (const [role, col] of c) {
    if (!b.has(role)) {
      out.push(
        drift("minor", "color", `role "${role}" (${col.hex}) on the page but not in spec`, {
          role,
          baseline: null,
          current: col.hex,
        })
      );
    }
  }
  return out;
}

function compareLayout(base, cur) {
  const out = [];
  const bl = base.layout || {};
  const cl = cur.layout || {};
  for (const field of ["spacingScale", "radii"]) {
    const b = bl[field] || [];
    const c = cl[field] || [];
    const added = c.filter((v) => !b.includes(v));
    const missing = b.filter((v) => !c.includes(v));
    if (added.length) {
      out.push(
        drift("minor", "layout", `${field}: ${added.join(", ")} not in spec`, { field, added })
      );
    }
    if (missing.length) {
      out.push(
        drift("minor", "layout", `${field}: ${missing.join(", ")} no longer present`, { field, missing })
      );
    }
  }
  return out;
}

/**
 * Component drift is reported but ALWAYS minor, deliberately.
 *
 * Component extraction is the least trustworthy part of the pipeline: the
 * representative button is picked by frequency, so a transparent nav button
 * can win over the real CTA, and the stripe fixture currently reports a 676px
 * tall "button-secondary". Failing builds on that would produce exactly the
 * flaky gate people switch off. Reported at minor, so `--fail-on any` can opt
 * in once extraction improves.
 *
 * Only the machine-token components (button-primary, card, ...) are compared,
 * not the prose sections, and only fields that are reliably measured. Height
 * and padding are excluded for the reason above.
 */
const COMPONENT_FIELDS = ["backgroundColor", "textColor", "rounded"];
const isTokenComponent = (k) => /^[a-z][a-z0-9-]*$/.test(k);

function compareComponents(base, cur) {
  const out = [];
  const b = base.components || {};
  const c = cur.components || {};

  for (const [name, props] of Object.entries(b)) {
    if (!isTokenComponent(name) || !props || typeof props !== "object") continue;
    const live = c[name];
    if (!live || typeof live !== "object") {
      out.push(
        drift("minor", "component", `component "${name}" in spec but not on the page`, {
          component: name,
        })
      );
      continue;
    }
    for (const f of COMPONENT_FIELDS) {
      const bv = props[f];
      const cv = live[f];
      if (!bv || !cv) continue;
      const same = f === "rounded" ? norm(bv) === norm(cv) : hex(bv) === hex(cv);
      if (!same) {
        out.push(
          drift("minor", "component", `${name}.${f}: ${bv} -> ${cv}`, {
            component: name,
            field: f,
            baseline: bv,
            current: cv,
          })
        );
      }
    }
  }
  return out;
}

/**
 * Theme is the tool's own interpretation rather than a measured value, so a
 * change here is reported but never fails a build on its own.
 */
function compareTheme(base, cur) {
  const out = [];
  const bt = base.theme || {};
  const ct = cur.theme || {};
  for (const field of ["mood", "density", "shape"]) {
    const b = bt[field];
    const c = ct[field];
    if (b && c && norm(b) !== norm(c)) {
      out.push(
        drift("minor", "theme", `${field} reads as "${c}", spec says "${b}"`, {
          field,
          baseline: b,
          current: c,
        })
      );
    }
  }
  return out;
}

/**
 * Compare a committed spec against a live extraction.
 *
 * @param {object} baseline parseDesign() of the committed DESIGN.md
 * @param {object} current  parseDesign() of markdown generated from the live URL
 * @returns {{drifts: Array, counts: {major: number, minor: number}}}
 */
export function compareDesigns(baseline, current) {
  const drifts = [
    ...compareTypography(baseline, current),
    ...compareColors(baseline, current),
    ...compareLayout(baseline, current),
    ...compareComponents(baseline, current),
    ...compareTheme(baseline, current),
  ];
  drifts.sort(
    (a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
  );
  return {
    drifts,
    counts: {
      major: drifts.filter((d) => d.severity === "major").length,
      minor: drifts.filter((d) => d.severity === "minor").length,
    },
  };
}

/**
 * Drift gets its own exit code rather than reusing 1.
 *
 * The CLI contract (test/cli-contract.test.js) already spends 1 on
 * operational errors and 2 on refusals. A CI job needs to tell "the design
 * changed" apart from "the tool fell over" — both are non-zero, but only one
 * of them means a human should look at a diff.
 */
export const EXIT_DRIFT = 3;

export function exitCodeFor({ counts }, failOn = "major") {
  if (failOn === "none") return 0;
  if (failOn === "any") return counts.major + counts.minor > 0 ? EXIT_DRIFT : 0;
  return counts.major > 0 ? EXIT_DRIFT : 0;
}

/** Human-readable report for a PR comment or terminal. */
export function formatDrift({ drifts, counts }, { url, specPath } = {}) {
  if (!drifts.length) {
    return `No drift. ${url || "page"} still matches ${specPath || "the spec"}.`;
  }
  const lines = [];
  lines.push(`Design drift: ${counts.major} major, ${counts.minor} minor`);
  if (url && specPath) lines.push(`${url} vs ${specPath}`);
  lines.push("");
  for (const d of drifts) {
    lines.push(`  ${d.severity === "major" ? "major" : "minor"}  ${d.kind.padEnd(10)} ${d.message}`);
  }
  return lines.join("\n");
}

