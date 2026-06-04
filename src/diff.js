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

function tableCell(s) {
  if (s == null || s === '') return '_unspecified_';
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
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
    let diffCount = 0;
    for (const k of [...keys].sort()) {
      const av = aProps[k];
      const bv = bProps[k];
      const same = av && bv && av === bv ? '=' : '≠';
      if (same === '≠') diffCount++;
      rows.push(`| ${tableCell(k)} | ${tableCell(av)} | ${tableCell(bv)} | ${same} |`);
    }
    const summary = diffCount === 0
      ? `\n\n_${aName} and ${bName} ${name.toLowerCase()} match across ${keys.size} properties._\n`
      : `\n\n_${diffCount} of ${keys.size} properties differ between ${aName} and ${bName} ${name.toLowerCase()}._\n`;
    blocks.push(`### ${name}\n\n| property | ${aName} | ${bName} | |\n|---|---|---|---|\n${rows.join('\n')}${summary}`);
  }
  return blocks.join('\n\n');
}

function whatToCopyAvoid(a, b, aName, bName) {
  const tips = [];
  const avoid = [];

  if (a.typography.primaryFont && b.typography.primaryFont) {
    if (a.typography.primaryFont === b.typography.primaryFont) {
      tips.push(`Both systems use \`${a.typography.primaryFont}\` as primary, typography is not where they diverge.`);
    } else {
      tips.push(`Primary fonts diverge (\`${a.typography.primaryFont}\` vs \`${b.typography.primaryFont}\`), typography is the cleanest brand-signature swap.`);
    }
  }

  const aRoles = a.typography.byRole || {};
  const bRoles = b.typography.byRole || {};
  const roleKeys = [...new Set([...Object.keys(aRoles), ...Object.keys(bRoles)])];
  for (const role of roleKeys) {
    if (aRoles[role] && bRoles[role] && aRoles[role] !== bRoles[role]) {
      tips.push(`${role} font differs: ${aName} uses \`${aRoles[role]}\`, ${bName} uses \`${bRoles[role]}\`.`);
    }
  }

  if (a.layout.spacingScale.length && b.layout.spacingScale.length) {
    const aSpacing = setOf(a.layout.spacingScale);
    const bSpacing = setOf(b.layout.spacingScale);
    const sharedSpacing = inter(aSpacing, bSpacing);
    if (sharedSpacing.length === 0) {
      avoid.push(`Spacing scales do not overlap. Picking values from both will produce visual noise.`);
    } else if (sharedSpacing.length < Math.min(aSpacing.size, bSpacing.size) / 2) {
      avoid.push(`Only ${sharedSpacing.length} shared spacing values (${sharedSpacing.join(', ')}). Mixing the rest will look uneven.`);
    }
  }

  const aRadii = setOf(a.layout.radii);
  const bRadii = setOf(b.layout.radii);
  const sharedRadii = inter(aRadii, bRadii);
  if (aRadii.size && bRadii.size && sharedRadii.length === 0) {
    avoid.push(`Border radii do not overlap. Components borrowed across will feel out of family.`);
  }

  const buttonsA = a.components['Buttons'];
  const buttonsB = b.components['Buttons'];
  if (buttonsA && buttonsB) {
    const radiusA = buttonsA['Corner radius'];
    const radiusB = buttonsB['Corner radius'];
    if (radiusA && radiusB && radiusA !== radiusB) {
      tips.push(`Button radius gap: ${aName} uses \`${radiusA}\`, ${bName} uses \`${radiusB}\`. Buttons are where users feel the difference fastest.`);
    }
  }

  return `### What to copy\n\n${tips.length ? tips.map(t => `- ${t}`).join('\n') : '_no useful copy signal_'}\n\n### What to avoid\n\n${avoid.length ? avoid.map(t => `- ${t}`).join('\n') : '_no obvious anti-pattern_'}`;
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
| Primary font | ${tableCell(a.typography.primaryFont)} | ${tableCell(b.typography.primaryFont)} |
| Secondary font | ${tableCell(a.typography.secondaryFont)} | ${tableCell(b.typography.secondaryFont)} |
| Heading scale | ${tableCell(a.typography.headingScale.join(', '))} | ${tableCell(b.typography.headingScale.join(', '))} |
| Body scale | ${tableCell(a.typography.bodyScale.join(', '))} | ${tableCell(b.typography.bodyScale.join(', '))} |
| Weights | ${tableCell(a.typography.weights.join(', '))} | ${tableCell(b.typography.weights.join(', '))} |
`;

  const spacingSection = `## Spacing & radii

| | ${aName} | ${bName} |
|---|---|---|
| Spacing scale | ${tableCell(a.layout.spacingScale.join(', '))} | ${tableCell(b.layout.spacingScale.join(', '))} |
| Border radii | ${tableCell(a.layout.radii.join(', '))} | ${tableCell(b.layout.radii.join(', '))} |
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
