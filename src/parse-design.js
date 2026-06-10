// Shared DESIGN.md parser used by gallery builder and diff command.
// Parses the 6-section format produced by brandmd.

function stripCodeMarks(s) {
  return s.replace(/^`(.+)`$/, '$1').replace(/`([^`]+)`/g, '$1');
}

function parseDesign(md) {
  const out = {
    title: null,
    sourceUrl: null,
    theme: {},
    colors: [],
    typography: { primaryFont: null, secondaryFont: null, byRole: {}, headingScale: [], bodyScale: [], captionScale: [], weights: [] },
    components: {},
    layout: { spacingScale: [], radii: [] },
    guidelines: { dos: [], donts: [] },
  };

  const titleMatch = md.match(/^#\s+(?:Design System:\s+)?(.+?)\s*$/m);
  if (titleMatch) out.title = titleMatch[1].trim();

  const sourceMatch = md.match(/generated from \[([^\]]+)\]\(([^)]+)\)/i);
  if (sourceMatch) out.sourceUrl = sourceMatch[2];

  // "Visual character" replaced "Overall mood" in v0.12; accept both so the
  // gallery keeps parsing pre-v0.12 DESIGN.md files.
  const moodMatch = md.match(/\*\*(?:Overall mood|Visual character):\*\*\s+(.+)/);
  if (moodMatch) out.theme.mood = moodMatch[1].trim();
  const densityMatch = md.match(/\*\*Density:\*\*\s+(.+)/);
  if (densityMatch) out.theme.density = densityMatch[1].trim();
  const shapeMatch = md.match(/\*\*Shape language:\*\*\s+(.+)/);
  if (shapeMatch) out.theme.shape = shapeMatch[1].trim();
  const depthMatch = md.match(/\*\*Depth:\*\*\s+(.+)/);
  if (depthMatch) out.theme.depth = depthMatch[1].trim();

  const colorRe = /^- \*\*([^*]+)\*\* \(`(#[0-9A-Fa-f]{3,8})`?\):\s*(.+)$/gm;
  for (const m of md.matchAll(colorRe)) {
    out.colors.push({ name: m[1].trim(), hex: m[2].toUpperCase(), role: m[3].trim() });
  }

  const primaryFont = md.match(/\*\*Primary font:\*\*\s+(.+)/);
  if (primaryFont) out.typography.primaryFont = primaryFont[1].trim();
  const secondaryFont = md.match(/\*\*Secondary font:\*\*\s+(.+)/);
  if (secondaryFont) out.typography.secondaryFont = secondaryFont[1].trim();

  const typeScaleBlock = md.split(/\*\*Type scale:\*\*/)[1];
  if (typeScaleBlock) {
    const before = typeScaleBlock.split(/\*\*Weights/)[0];
    const headingScale = before.match(/^- Headings:\s+(.+)$/m);
    if (headingScale) out.typography.headingScale = headingScale[1].split(',').map(s => s.trim());
    const bodyScale = before.match(/^- Body \/ UI:\s+(.+)$/m);
    if (bodyScale) out.typography.bodyScale = bodyScale[1].split(',').map(s => s.trim());
    const captionScale = before.match(/^- Captions \/ Small:\s+(.+)$/m);
    if (captionScale) out.typography.captionScale = captionScale[1].split(',').map(s => s.trim());
  }

  const fontsByRoleBlock = md.split(/\*\*Fonts by role:\*\*/)[1];
  if (fontsByRoleBlock) {
    const before = fontsByRoleBlock.split(/\*\*Type scale/)[0];
    for (const m of before.matchAll(/^- (\w+):\s+(.+)$/gm)) {
      out.typography.byRole[m[1].toLowerCase()] = m[2].trim();
    }
  }

  const weights = md.match(/\*\*Weights in use:\*\*\s+(.+)/);
  if (weights) out.typography.weights = weights[1].split(',').map(s => s.trim());

  const componentSection = md.split(/^## 4\. Component Stylings/m)[1];
  if (componentSection) {
    const beforeNext = componentSection.split(/^## \d/m)[0];
    const componentRe = /^### ([^\n]+?)\s*$([\s\S]*?)(?=^###|\z)/gm;
    for (const m of beforeNext.matchAll(componentRe)) {
      const name = m[1].trim();
      const body = m[2].trim();
      const props = {};
      for (const line of body.split('\n')) {
        const fieldMatch = line.match(/^- ([^:]+):\s+(.+)$/);
        if (fieldMatch) props[fieldMatch[1].trim()] = stripCodeMarks(fieldMatch[2].trim());
      }
      out.components[name] = props;
    }
  }

  const spacingMatch = md.match(/\*\*Spacing scale:\*\*\s+(.+)/);
  if (spacingMatch) out.layout.spacingScale = spacingMatch[1].split(',').map(s => s.trim());
  const radiiMatch = md.match(/\*\*Border radii:\*\*\s+(.+)/);
  if (radiiMatch) out.layout.radii = radiiMatch[1].split(',').map(s => s.trim());

  const dosSection = md.split(/^### Do\s*$/m)[1];
  if (dosSection) {
    const before = dosSection.split(/^### /m)[0];
    out.guidelines.dos = [...before.matchAll(/^- (.+)$/gm)].map(m => m[1].trim());
  }
  const dontsSection = md.split(/^### Don't\s*$/m)[1];
  if (dontsSection) {
    const before = dontsSection.split(/^## /m)[0];
    out.guidelines.donts = [...before.matchAll(/^- (.+)$/gm)].map(m => m[1].trim());
  }

  return out;
}

export { parseDesign };
