#!/usr/bin/env node
// Builds the brandmd gallery: reads gallery/brands.yml, parses each example DESIGN.md,
// generates docs/<slug>.html for each brand + docs/index.html as the listing.
// No external deps beyond what brandmd already uses.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseDesign } from '../src/parse-design.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function parseBrandsYml(text) {
  const brands = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (!line || line.startsWith('brands:')) continue;
    const startMatch = line.match(/^\s*-\s+(\w+):\s*(.+)$/);
    if (startMatch) {
      if (current) brands.push(current);
      current = { [startMatch[1]]: startMatch[2] };
      continue;
    }
    const fieldMatch = line.match(/^\s+(\w+):\s*(.+)$/);
    if (fieldMatch && current) {
      current[fieldMatch[1]] = fieldMatch[2];
    }
  }
  if (current) brands.push(current);
  return brands;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function textColor(hex) {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#000';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#000' : '#fff';
}

const BASE_CSS = `
  *{box-sizing:border-box}
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif;background:#0d1117;color:#e6edf3;line-height:1.6}
  a{color:#79c0ff;text-decoration:none}
  a:hover{text-decoration:underline}
  .container{max-width:960px;margin:0 auto;padding:48px 24px}
  header.site{border-bottom:1px solid #30363d;padding-bottom:24px;margin-bottom:32px}
  header.site h1{margin:0 0 8px;font-size:32px;font-weight:600}
  header.site p{margin:0;color:#7d8590}
  h2{font-size:20px;font-weight:600;margin:40px 0 16px;color:#e6edf3}
  h3{font-size:15px;font-weight:600;margin:24px 0 12px;color:#c9d1d9;text-transform:uppercase;letter-spacing:0.05em}
  .meta{color:#7d8590;font-size:13px;margin-top:4px}
  .swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin:16px 0}
  .swatch{padding:16px;border-radius:6px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
  .swatch .name{font-weight:600;margin-bottom:4px}
  .swatch .hex{opacity:0.85}
  .swatch .role{opacity:0.7;font-size:11px;margin-top:6px;font-family:inherit}
  .type-sample{padding:24px;background:#161b22;border:1px solid #30363d;border-radius:6px;margin:16px 0}
  .type-sample .display{font-size:36px;font-weight:600;margin-bottom:8px}
  .type-sample .body{font-size:14px;color:#c9d1d9}
  .tokens{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
  .token{background:#161b22;border:1px solid #30363d;border-radius:4px;padding:6px 10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;color:#c9d1d9}
  .component{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:16px;margin:8px 0}
  .component .label{font-weight:600;font-size:14px;color:#e6edf3;margin-bottom:8px}
  .component .props{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;color:#7d8590;line-height:1.8}
  .guidelines{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:16px 0}
  .guidelines ul{padding-left:20px;margin:0}
  .guidelines li{margin:4px 0;font-size:13px;color:#c9d1d9}
  .do-col h3{color:#3fb950}
  .dont-col h3{color:#f85149}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:24px 0}
  .card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:24px;transition:border-color 0.15s}
  .card:hover{border-color:#79c0ff}
  .card h2{margin:0 0 8px;font-size:18px}
  .card .cat{display:inline-block;padding:2px 8px;background:#21262d;border-radius:10px;font-size:11px;color:#7d8590;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px}
  .card .preview{display:flex;gap:4px;margin-top:12px}
  .card .preview span{width:24px;height:24px;border-radius:4px;display:inline-block}
  footer.site{margin-top:64px;padding-top:24px;border-top:1px solid #30363d;color:#7d8590;font-size:13px}
  footer.site code{background:#161b22;padding:2px 6px;border-radius:4px;font-size:12px}
  @media (max-width:600px){.guidelines{grid-template-columns:1fr}}
`;

function renderBrandPage(brand, design) {
  const generated = new Date().toISOString().split('T')[0];
  const colorSwatches = design.colors.map(c => `
    <div class="swatch" style="background:${esc(c.hex)};color:${textColor(c.hex)}">
      <div class="name">${esc(c.name)}</div>
      <div class="hex">${esc(c.hex)}</div>
      <div class="role">${esc(c.role)}</div>
    </div>
  `).join('');

  const typeSample = `
    <div class="type-sample">
      <div class="display" style="font-family:'${esc(design.typography.primaryFont || 'inherit')}',-apple-system,sans-serif">The quick brown fox</div>
      <div class="body" style="font-family:'${esc(design.typography.primaryFont || 'inherit')}',-apple-system,sans-serif">Body sample at 14px. The quick brown fox jumps over the lazy dog. 0123456789</div>
    </div>
    <h3>Primary font</h3>
    <div class="tokens"><span class="token">${esc(design.typography.primaryFont || 'unspecified')}</span></div>
    ${design.typography.secondaryFont ? `<h3>Secondary font</h3><div class="tokens"><span class="token">${esc(design.typography.secondaryFont)}</span></div>` : ''}
    ${design.typography.headingScale.length ? `<h3>Heading scale</h3><div class="tokens">${design.typography.headingScale.map(s => `<span class="token">${esc(s)}</span>`).join('')}</div>` : ''}
    ${design.typography.bodyScale.length ? `<h3>Body scale</h3><div class="tokens">${design.typography.bodyScale.map(s => `<span class="token">${esc(s)}</span>`).join('')}</div>` : ''}
    ${design.typography.weights.length ? `<h3>Weights</h3><div class="tokens">${design.typography.weights.map(s => `<span class="token">${esc(s)}</span>`).join('')}</div>` : ''}
  `;

  const componentBlocks = Object.entries(design.components).map(([name, props]) => `
    <div class="component">
      <div class="label">${esc(name)}</div>
      <div class="props">${Object.entries(props).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join('<br>')}</div>
    </div>
  `).join('');

  const layoutTokens = `
    ${design.layout.spacingScale.length ? `<h3>Spacing scale</h3><div class="tokens">${design.layout.spacingScale.map(s => `<span class="token">${esc(s)}</span>`).join('')}</div>` : ''}
    ${design.layout.radii.length ? `<h3>Border radii</h3><div class="tokens">${design.layout.radii.map(s => `<span class="token">${esc(s)}</span>`).join('')}</div>` : ''}
  `;

  const guidelines = `
    <div class="guidelines">
      <div class="do-col"><h3>Do</h3><ul>${design.guidelines.dos.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>
      <div class="dont-col"><h3>Don't</h3><ul>${design.guidelines.donts.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>
    </div>
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(brand.name)} brand snapshot — brandmd</title>
<meta name="description" content="${esc(brand.name)} design system snapshot extracted by brandmd from ${esc(brand.url)}">
<style>${BASE_CSS}</style>
</head>
<body>
<div class="container">
<header class="site">
  <p style="margin:0 0 8px"><a href="./index.html">← brandmd gallery</a></p>
  <h1>${esc(brand.name)}</h1>
  <p>Snapshot of <a href="${esc(brand.url)}" target="_blank" rel="noopener">${esc(brand.url)}</a>, extracted by brandmd. This is not the canonical ${esc(brand.name)} brand guideline.</p>
  <p class="meta">Category: ${esc(brand.category)} · Generated ${generated}</p>
</header>

<h2>Color palette</h2>
<div class="swatches">${colorSwatches}</div>

<h2>Typography</h2>
${typeSample}

<h2>Components</h2>
${componentBlocks || '<p class="meta">No component-level data extracted.</p>'}

<h2>Layout tokens</h2>
${layoutTokens}

<h2>Guidelines</h2>
${guidelines}

<footer class="site">
<p>Generated ${generated} from <a href="${esc(brand.url)}" target="_blank" rel="noopener">${esc(brand.url)}</a> using <code>npx brandmd ${esc(brand.url)}</code>.</p>
<p>Generate one for your site: <code>npx brandmd https://yoursite.com</code></p>
<p><a href="https://github.com/yuvrajangadsingh/brandmd">brandmd on GitHub</a> · <a href="./index.html">all snapshots</a></p>
</footer>
</div>
</body>
</html>
`;
}

function renderIndex(brands, designs) {
  const cards = brands.map(brand => {
    const design = designs[brand.slug];
    const previewColors = design.colors.slice(0, 5).map(c => `<span style="background:${esc(c.hex)}"></span>`).join('');
    return `
      <a href="./${esc(brand.slug)}.html" class="card">
        <div class="cat">${esc(brand.category)}</div>
        <h2>${esc(brand.name)}</h2>
        <div class="meta">${esc(brand.url.replace(/^https?:\/\//, ''))}</div>
        <div class="preview">${previewColors}</div>
      </a>
    `;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>brandmd gallery — brand design system snapshots</title>
<meta name="description" content="Snapshots of public brand design systems extracted by brandmd. Use as references for AI coding agents.">
<style>${BASE_CSS}</style>
</head>
<body>
<div class="container">
<header class="site">
  <h1>brandmd gallery</h1>
  <p>Design system snapshots extracted from public brand sites by <a href="https://github.com/yuvrajangadsingh/brandmd">brandmd</a>. Use them as reference, or generate one for your own site.</p>
</header>

<div class="cards">${cards}</div>

<footer class="site">
<p>Generate one for your site: <code>npx brandmd https://yoursite.com</code></p>
<p>Each snapshot is generated from a single public page visit. Not affiliated with any of the brands shown. Treat as observed, not canonical.</p>
<p><a href="https://github.com/yuvrajangadsingh/brandmd">brandmd on GitHub</a> · <a href="https://www.npmjs.com/package/brandmd">npm</a></p>
</footer>
</div>
</body>
</html>
`;
}

function main() {
  const yml = fs.readFileSync(path.join(ROOT, 'gallery/brands.yml'), 'utf8');
  const brands = parseBrandsYml(yml);

  const docsDir = path.join(ROOT, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

  const designs = {};
  for (const brand of brands) {
    const md = fs.readFileSync(path.join(ROOT, brand.example), 'utf8');
    const design = parseDesign(md);
    designs[brand.slug] = design;
    const html = renderBrandPage(brand, design);
    const out = path.join(docsDir, `${brand.slug}.html`);
    fs.writeFileSync(out, html);
    console.log(`wrote ${out} (${design.colors.length} colors, ${Object.keys(design.components).length} components)`);
  }

  const indexHtml = renderIndex(brands, designs);
  fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml);
  console.log(`wrote ${path.join(docsDir, 'index.html')} (${brands.length} brands)`);
}

main();
