// Shared DESIGN.md parser used by the gallery builder and the diff command.
//
// v0.14 emits the official DESIGN.md format: YAML frontmatter (the normative,
// machine-readable tokens) plus canonical prose sections. This parser reads the
// frontmatter first (so generate -> parseDesign -> diff round-trips every emitted
// token exactly) and falls back to prose parsing for older, frontmatter-less
// files. Prose supplies the fields that never live in frontmatter (title,
// source URL, guidelines, visual-character prose).

function stripCodeMarks(s) {
  return s.replace(/^`(.+)`$/, "$1").replace(/`([^`]+)`/g, "$1");
}

/**
 * Minimal YAML reader for the fixed-indent subset brandmd emits:
 *   key: scalar
 *   key:
 *     name: scalar            (2-space map entries)
 *   key:
 *     level:                  (2-space)
 *       prop: scalar          (4-space nested props)
 * Quotes are stripped; nothing fancy (no flow syntax, anchors, or multiline).
 */
function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const lines = m[1].split("\n");
  const root = {};
  let curKey = null;   // top-level block key (colors/typography/...)
  let curSub = null;   // nested map key (a typography level / component name)

  const unquote = (v) => {
    const s = v.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return s;
  };

  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    const val = line.slice(ci + 1).trim();

    if (indent === 0) {
      curKey = null; curSub = null;
      if (val === "") { root[key] = {}; curKey = key; }
      else root[key] = unquote(val);
    } else if (indent === 2 && curKey) {
      if (val === "") { root[curKey][key] = {}; curSub = key; }
      else { root[curKey][key] = unquote(val); curSub = null; }
    } else if (indent >= 4 && curKey && curSub) {
      if (typeof root[curKey][curSub] !== "object") root[curKey][curSub] = {};
      root[curKey][curSub][key] = unquote(val);
    }
  }
  return root;
}

/**
 * One hex normalization for BOTH the frontmatter and legacy-prose paths:
 * uppercase, the convention `brandmd diff` has always compared with. A v0.13
 * uppercase file and a v0.14 lowercase file therefore diff by value, never by
 * casing. (Emission stays lowercase; this is parse-side normalization only.)
 */
function normHex(s) {
  const m = String(s).match(/#[0-9a-fA-F]{3,8}/);
  return m ? m[0].toUpperCase() : String(s);
}

function parseDesign(md) {
  // Normalize Windows/old-Mac line endings first: the frontmatter fence and all
  // the ^...$ anchors below assume \n, and a CRLF file must parse identically.
  md = String(md).replace(/\r\n?/g, "\n");

  const out = {
    title: null,
    sourceUrl: null,
    sources: null,
    theme: {},
    colors: [],
    typography: { primaryFont: null, secondaryFont: null, byRole: {}, headingScale: [], bodyScale: [], captionScale: [], weights: [] },
    components: {},
    layout: { spacingScale: [], radii: [] },
    guidelines: { dos: [], donts: [] },
  };

  const fm = parseFrontmatter(md);

  // --- Title: H1 first, frontmatter name second ---
  const titleMatch = md.match(/^#\s+(?:Design System:\s+)?(.+?)\s*$/m);
  if (titleMatch) out.title = titleMatch[1].trim();
  else if (fm?.name) out.title = fm.name;

  // --- Source URL(s): single-page "Extracted from [url](url)" or the
  // multi-page "Extracted from N pages by brandmd:" list of "> - [url](url)" ---
  const sourceMatch = md.match(/Extracted from\s*\[([^\]]+)\]\(([^)]+)\)/i);
  if (sourceMatch) out.sourceUrl = sourceMatch[2];
  const multiMatch = md.match(/Extracted from \d+ pages by brandmd:\n((?:>\s*-\s*\[[^\]]+\]\([^)]+\)\n?)+)/i);
  if (multiMatch) {
    out.sources = [...multiMatch[1].matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[2]);
    if (!out.sourceUrl && out.sources.length) out.sourceUrl = out.sources[0];
  }

  // --- Theme prose (not in frontmatter) ---
  const moodMatch = md.match(/\*\*(?:Overall mood|Visual character):\*\*\s+(.+)/);
  if (moodMatch) out.theme.mood = moodMatch[1].trim();
  const densityMatch = md.match(/\*\*Density:\*\*\s+(.+)/);
  if (densityMatch) out.theme.density = densityMatch[1].trim();
  const shapeMatch = md.match(/\*\*Shape language:\*\*\s+(.+)/);
  if (shapeMatch) out.theme.shape = shapeMatch[1].trim();
  const depthMatch = md.match(/\*\*Depth:\*\*\s+(.+)/);
  if (depthMatch) out.theme.depth = depthMatch[1].trim();

  if (fm) {
    // --- Colors from frontmatter (authoritative) ---
    for (const [name, hex] of Object.entries(fm.colors || {})) {
      out.colors.push({ name, hex: normHex(hex), role: name });
    }
    // --- Typography from frontmatter ---
    const levels = Object.entries(fm.typography || {});
    const families = [];
    const sizes = [];
    const weights = new Set();
    for (const [level, props] of levels) {
      if (props.fontFamily && !families.includes(props.fontFamily)) families.push(props.fontFamily);
      if (props.fontFamily) out.typography.byRole[level] = props.fontFamily;
      const px = parseFloat(props.fontSize);
      if (isFinite(px)) sizes.push({ level, px, size: props.fontSize });
      if (props.fontWeight != null) weights.add(String(props.fontWeight));
    }
    out.typography.primaryFont = families[0] || null;
    out.typography.secondaryFont = families[1] || null;
    out.typography.weights = [...weights];
    out.typography.headingScale = sizes.filter((s) => s.px >= 24).sort((a, b) => b.px - a.px).map((s) => s.size);
    out.typography.bodyScale = sizes.filter((s) => s.px >= 14 && s.px < 24).sort((a, b) => b.px - a.px).map((s) => s.size);
    out.typography.captionScale = sizes.filter((s) => s.px < 14).sort((a, b) => b.px - a.px).map((s) => s.size);
    // --- Layout from frontmatter ---
    out.layout.spacingScale = Object.values(fm.spacing || {}).map(String);
    out.layout.radii = Object.values(fm.rounded || {}).map(String);
    // --- Components from frontmatter (normative machine tokens). These are the
    // fields `brandmd diff` must see change when a YAML value is edited; the
    // prose subsections below add their human-named counterparts separately. ---
    for (const [name, props] of Object.entries(fm.components || {})) {
      if (props && typeof props === "object" && Object.keys(props).length) {
        out.components[name] = { ...props };
      }
    }
  } else {
    parseLegacyBody(md, out);
  }

  // Fonts-by-role and component styles live in the prose sections in every
  // format version, so parse them from prose regardless of frontmatter. (The
  // prose carries the human field names — "Font size", "Corner radius" — that
  // the frontmatter's spec token names don't.)
  parseFontsByRole(md, out);
  parseComponentProse(md, out);

  // --- Guidelines from prose (canonical "Do's and Don'ts" or legacy "Do/Don't") ---
  parseGuidelines(md, out);

  return out;
}

/** Parse the "**Fonts by role:**" prose block (multi-word roles included). */
function parseFontsByRole(md, out) {
  const block = md.split(/\*\*Fonts by role:\*\*/)[1];
  if (!block) return;
  const before = block.split(/\*\*(?:Type scale|All detected)/)[0];
  for (const m of before.matchAll(/^- ([^:]+):\s+(.+)$/gm)) {
    out.typography.byRole[m[1].trim().toLowerCase()] = m[2].trim();
  }
}

/** Parse the ### component subsections under "## Components". End-safe. */
function parseComponentProse(md, out) {
  const section = md.split(/^##\s+(?:\d+\.\s+)?Components?\b/m)[1];
  if (!section) return;
  const beforeNext = section.split(/^## /m)[0];
  const componentRe = /^### ([^\n]+?)\s*\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm;
  for (const m of beforeNext.matchAll(componentRe)) {
    const name = m[1].trim();
    const props = {};
    for (const line of m[2].trim().split("\n")) {
      const f = line.match(/^- ([^:]+):\s+(.+)$/);
      if (f) props[f[1].trim()] = stripCodeMarks(f[2].trim());
    }
    if (Object.keys(props).length) out.components[name] = props;
  }
}

/**
 * Legacy prose parsing for pre-v0.14 (frontmatter-less) DESIGN.md files, with the
 * F-03 fixes: end-safe component terminator (no bogus `\z` anchor), multi-word
 * role labels, and light/dark color separation.
 */
function parseLegacyBody(md, out) {
  // Colors: stop the role at end-of-line; accept multi-word roles ("Display / hero").
  // Only read the light palette — a "Dark" / "Dark Theme" heading ends it so dark
  // overrides don't fold into the light colors.
  const lightZone = md.split(/^##\s+(?:\d+\.\s+)?Dark\b/mi)[0];
  const colorRe = /^- \*\*([^*]+)\*\* \(`?(#[0-9A-Fa-f]{3,8})`?\):\s*(.+)$/gm;
  for (const m of lightZone.matchAll(colorRe)) {
    out.colors.push({ name: m[1].trim(), hex: normHex(m[2]), role: m[3].trim() });
  }

  const primaryFont = md.match(/\*\*Primary font:\*\*\s+(.+)/);
  if (primaryFont) out.typography.primaryFont = primaryFont[1].trim();
  const secondaryFont = md.match(/\*\*Secondary font:\*\*\s+(.+)/);
  if (secondaryFont) out.typography.secondaryFont = secondaryFont[1].trim();

  const typeScaleBlock = md.split(/\*\*Type scale:\*\*/)[1];
  if (typeScaleBlock) {
    const before = typeScaleBlock.split(/\*\*Weights/)[0];
    const heading = before.match(/^- Headings:\s+(.+)$/m);
    if (heading) out.typography.headingScale = heading[1].split(",").map((s) => s.trim());
    const body = before.match(/^- Body \/ UI:\s+(.+)$/m);
    if (body) out.typography.bodyScale = body[1].split(",").map((s) => s.trim());
    const caption = before.match(/^- Captions \/ Small:\s+(.+)$/m);
    if (caption) out.typography.captionScale = caption[1].split(",").map((s) => s.trim());
  }

  const weights = md.match(/\*\*Weights in use:\*\*\s+(.+)/);
  if (weights) out.typography.weights = weights[1].split(",").map((s) => s.trim());

  const spacingMatch = md.match(/\*\*Spacing scale:\*\*\s+(.+)/);
  if (spacingMatch) out.layout.spacingScale = spacingMatch[1].split(",").map((s) => s.trim());
  const radiiMatch = md.match(/\*\*Border radii:\*\*\s+(.+)/);
  if (radiiMatch) out.layout.radii = radiiMatch[1].split(",").map((s) => s.trim());
}

function parseGuidelines(md, out) {
  // Canonical "## Do's and Don'ts": a flat list of "- Do ..." / "- Don't ...".
  const dodont = md.split(/^##\s+Do's and Don'ts\s*$/m)[1];
  if (dodont) {
    const block = dodont.split(/^## /m)[0];
    for (const m of block.matchAll(/^- (.+)$/gm)) {
      const item = m[1].trim();
      if (/^Don['’]t\b/i.test(item)) out.guidelines.donts.push(item);
      else if (/^Do\b/i.test(item)) out.guidelines.dos.push(item);
    }
    return;
  }
  // Legacy "### Do" / "### Don't" subsections.
  const dosSection = md.split(/^### Do\s*$/m)[1];
  if (dosSection) {
    const before = dosSection.split(/^### /m)[0];
    out.guidelines.dos = [...before.matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
  }
  const dontsSection = md.split(/^### Don't\s*$/m)[1];
  if (dontsSection) {
    const before = dontsSection.split(/^## /m)[0];
    out.guidelines.donts = [...before.matchAll(/^- (.+)$/gm)].map((m) => m[1].trim());
  }
}

export { parseDesign };
