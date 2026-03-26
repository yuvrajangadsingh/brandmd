/**
 * Escape HTML special characters to prevent XSS.
 */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generate a self-contained HTML brand guide from analyzed tokens.
 */
export function generateHTML(tokens) {
  const siteName = esc(tokens.title || new URL(tokens.url).hostname);
  const colors = tokens.palette.map(
    (c) => `<div class="swatch" style="--c:${esc(c.hex)}"><div class="swatch-color"></div><code>${esc(c.hex)}</code><span>${esc(c.role)}</span></div>`
  ).join("\n        ");

  const fonts = [tokens.typography.primary, tokens.typography.secondary].filter(Boolean).map(
    (f) => `<div class="font-specimen"><h3 style="font-family:'${esc(f)}',system-ui">${esc(f)}</h3><p style="font-family:'${esc(f)}',system-ui;font-size:14px">The quick brown fox jumps over the lazy dog</p><p style="font-family:'${esc(f)}',system-ui;font-size:20px">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p></div>`
  ).join("\n        ");

  const topSpacing = [...tokens.spacing]
    .sort((a, b) => b.freq - a.freq)
    .slice(0, 8)
    .sort((a, b) => a.px - b.px);
  const spacingBoxes = topSpacing.map(
    (s) => `<div class="space-item"><div class="space-box" style="width:${s.val};height:${s.val}"></div><code>${s.val}</code></div>`
  ).join("\n        ");

  const radiiItems = tokens.radii.map(
    (r) => `<div class="radius-item"><div class="radius-box" style="border-radius:${r.val}"></div><code>${r.val}</code></div>`
  ).join("\n        ");

  const shadowItems = tokens.shadows.map(
    (s) => `<div class="shadow-item"><div class="shadow-box" style="box-shadow:${esc(s.val)}"></div><code>${esc(s.val)}</code></div>`
  ).join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Brand Guide: ${siteName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#111;color:#ddd;font-family:system-ui,sans-serif;padding:40px;max-width:960px;margin:0 auto}
h1{font-size:28px;margin-bottom:4px}
h2{font-size:20px;margin:36px 0 16px;color:#fff;border-bottom:1px solid #333;padding-bottom:8px}
h3{font-size:16px;color:#ccc;margin-bottom:4px}
p.sub{color:#888;font-size:14px;margin-bottom:32px}
code{font-size:12px;color:#aaa;background:#1a1a1a;padding:2px 6px;border-radius:3px}
.grid{display:flex;flex-wrap:wrap;gap:16px}
.swatch{display:flex;flex-direction:column;gap:4px;width:120px}
.swatch-color{width:120px;height:72px;border-radius:8px;background:var(--c);border:1px solid #333}
.swatch span{font-size:12px;color:#888}
.font-specimen{background:#1a1a1a;padding:16px;border-radius:8px;margin-bottom:12px}
.font-specimen p{color:#ccc;margin-top:8px}
.space-item{display:flex;flex-direction:column;align-items:center;gap:4px}
.space-box{background:#5E6AD2;border-radius:2px;min-width:4px;min-height:4px}
.radius-item{display:flex;flex-direction:column;align-items:center;gap:4px}
.radius-box{width:60px;height:60px;background:transparent;border:2px solid #5E6AD2}
.shadow-item{margin-bottom:12px}
.shadow-box{width:200px;height:60px;background:#1a1a1a;border-radius:8px}
.shadow-item code{display:block;margin-top:6px;max-width:400px;word-break:break-all}
</style>
</head>
<body>
  <h1>${siteName}</h1>
  <p class="sub">${esc(tokens.url)}</p>

  <h2>Colors</h2>
  <div class="grid">
    ${colors}
  </div>

  <h2>Typography</h2>
  <div>
    ${fonts}
  </div>

  <h2>Spacing</h2>
  <div class="grid">
    ${spacingBoxes}
  </div>

  <h2>Border Radii</h2>
  <div class="grid">
    ${radiiItems}
  </div>

  ${tokens.shadows.length > 0 ? `<h2>Shadows</h2>\n  <div>\n    ${shadowItems}\n  </div>` : ""}
</body>
</html>`;
}
