// brandmd diff: compares two DESIGN.md files and writes a markdown diff
// to <out>. Local files only in v0.11. URL input deferred to v0.11.1.

import fs from 'fs';
import path from 'path';
import { parseDesign } from './parse-design.js';

function setOf(arr) { return new Set((arr || []).filter(Boolean)); }

function inter(a, b) { return [...a].filter(x => b.has(x)); }
function diff(a, b) { return [...a].filter(x => !b.has(x)); }

function colorBlock(label, items) {
  if (!items.length) return `### ${label}\n\n_none_\n`;
  const lines = items.map(c => `- \`${c.hex}\` — ${c.name} (${c.role})`).join('\n');
  return `### ${label}\n\n${lines}\n`;
}

function tokenList(label, items) {
  if (!items.length) return `### ${label}\n\n_none_\n`;
  return `### ${label}\n\n${items.map(t => `\`${t}\``).join(' · ')}\n`;
}

function componentDiff(aComps, bComps, aName, bName) {
  const allNames = new Set([...Object.keys(aComps), ...Object.keys(bComps)]);
  if (!allNames.size) return '_no component data on either side_';
  const blocks = [];
  for (const name of [...allNames].sort()) {
    const aProps = aComps[name];
    const bProps = bComps[name];
    if (!aProps) { blocks.push(`### ${name}\n\n_only in ${bName}_:\n\`\`\`\n${Object.entries(bProps).map(([k,v]) => `${k}: ${v}`).join('\n')}\n\`\`\``); continue; }
    if (!bProps) { blocks.push(`### ${name}\n\n_only in ${aName}_:\n\`\`\`\n${Object.entries(aProps).map(([k,v]) => `${k}: ${v}`).join('\n')}\n\`\`\``); continue; }
    const rows = [];
    const keys = new Set([...Object.keys(aProps), ...Object.keys(bProps)]);
    for (const k of [...keys].sort()) {
      const av = aProps[k] || '_unspecified_';
      const bv = bProps[k] || '_unspecified_';
      const same = av === bv ? '=' : '≠';
      rows.push(`| ${k} | ${av} | ${bv} | ${same} |`);
    }
    blocks.push(`### ${name}\n\n| property | ${aName} | ${bName} | |\n|---|---|---|---|\n${rows.join('\n')}`);
  }
  return blocks.join('\n\n');
}

function whatToCopyAvoid(a, b, aName, bName) {
  const aColors = setOf(a.colors.map(c => c.hex));
  const bColors = setOf(b.colors.map(c => c.hex));
  const shared = inter(aColors, bColors);
  const aOnly = diff(aColors, bColors);
  const bOnly = diff(bColors, aColors);

  const fontMatch = a.typography.primaryFont && b.typography.primaryFont && a.typography.primaryFont === b.typography.primaryFont;

  const tips = [];
  if (shared.length) tips.push(`**Shared color signal** (both use ${shared.length} of the same hex values): treat these as safe to use across either system.`);
  if (fontMatch) tips.push(`**Same primary font** (\`${a.typography.primaryFont}\`): typography is interchangeable, less wedge for differentiation.`);
  if (!fontMatch && a.typography.primaryFont && b.typography.primaryFont) tips.push(`**Different primary fonts** (${a.typography.primaryFont} vs ${b.typography.primaryFont}): typography is the strongest brand-divergence axis here.`);
  if (aOnly.length >= 3) tips.push(`**${aName}-only accents** (${aOnly.length} hex values): use sparingly when borrowing from ${aName}, they carry the brand signature.`);
  if (bOnly.length >= 3) tips.push(`**${bName}-only accents** (${bOnly.length} hex values): same, carry ${bName} brand signature.`);

  const avoid = [];
  if (a.layout.spacingScale.length && b.layout.spacingScale.length) {
    const aSpacing = setOf(a.layout.spacingScale);
    const bSpacing = setOf(b.layout.spacingScale);
    const sharedSpacing = inter(aSpacing, bSpacing);
    if (sharedSpacing.length === 0) avoid.push(`**Mixing spacing scales**: no shared values between the two. Pick one, do not blend.`);
  }
  if (Object.keys(a.components).length && Object.keys(b.components).length) {
    avoid.push(`**Cross-borrowing component styling without context**: button radius and padding differ between systems and define brand feel.`);
  }

  return `### What to copy\n\n${tips.length ? tips.map(t => `- ${t}`).join('\n') : '_no obvious shared signal_'}\n\n### What to avoid\n\n${avoid.length ? avoid.map(t => `- ${t}`).join('\n') : '_no obvious anti-pattern_'}`;
}

export function diffDesigns(aPath, bPath, outPath) {
  const aMd = fs.readFileSync(aPath, 'utf8');
  const bMd = fs.readFileSync(bPath, 'utf8');
  const a = parseDesign(aMd);
  const b = parseDesign(bMd);
  const aName = a.title?.split(/[|:–\-]/)[0].trim() || path.basename(aPath, '.md');
  const bName = b.title?.split(/[|:–\-]/)[0].trim() || path.basename(bPath, '.md');

  const aColors = setOf(a.colors.map(c => c.hex));
  const bColors = setOf(b.colors.map(c => c.hex));
  const sharedHex = inter(aColors, bColors);
  const aOnlyColors = a.colors.filter(c => !bColors.has(c.hex));
  const bOnlyColors = b.colors.filter(c => !aColors.has(c.hex));
  const sharedColors = a.colors.filter(c => sharedHex.includes(c.hex));

  const typographySection = `## Typography

| | ${aName} | ${bName} |
|---|---|---|
| Primary font | ${a.typography.primaryFont || '_unspecified_'} | ${b.typography.primaryFont || '_unspecified_'} |
| Secondary font | ${a.typography.secondaryFont || '_unspecified_'} | ${b.typography.secondaryFont || '_unspecified_'} |
| Heading scale | ${a.typography.headingScale.join(', ') || '_unspecified_'} | ${b.typography.headingScale.join(', ') || '_unspecified_'} |
| Body scale | ${a.typography.bodyScale.join(', ') || '_unspecified_'} | ${b.typography.bodyScale.join(', ') || '_unspecified_'} |
| Weights | ${a.typography.weights.join(', ') || '_unspecified_'} | ${b.typography.weights.join(', ') || '_unspecified_'} |
`;

  const spacingSection = `## Spacing & radii

| | ${aName} | ${bName} |
|---|---|---|
| Spacing scale | ${a.layout.spacingScale.join(', ') || '_unspecified_'} | ${b.layout.spacingScale.join(', ') || '_unspecified_'} |
| Border radii | ${a.layout.radii.join(', ') || '_unspecified_'} | ${b.layout.radii.join(', ') || '_unspecified_'} |
`;

  const componentsSection = `## Components

${componentDiff(a.components, b.components, aName, bName)}
`;

  const tipsSection = `## Synthesis

${whatToCopyAvoid(a, b, aName, bName)}
`;

  const out = `# Brand diff: ${aName} vs ${bName}

> Generated by \`brandmd diff\` from ${path.basename(aPath)} and ${path.basename(bPath)}.
>
> Both files are snapshots, not canonical guidelines.

## Color palette

${colorBlock(`Shared (${sharedColors.length})`, sharedColors)}
${colorBlock(`Only in ${aName} (${aOnlyColors.length})`, aOnlyColors)}
${colorBlock(`Only in ${bName} (${bOnlyColors.length})`, bOnlyColors)}

${typographySection}
${spacingSection}
${componentsSection}
${tipsSection}
`;

  fs.writeFileSync(outPath, out);
  return { aName, bName, sharedColors: sharedColors.length, aOnly: aOnlyColors.length, bOnly: bOnlyColors.length };
}
