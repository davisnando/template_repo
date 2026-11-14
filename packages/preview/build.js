// Static preview: the exact markup + CSS both platforms ship, with demo content baked in.
import { sections, bodySections } from '../core/sections.js';
import { staticContext, esc } from '../core/context.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { baseCss, tokenCss, navAnchors, fontFaceCss, loadFonts, FONTS_DIR } from '../core/style.js';

export function buildPreview(style, art) {
  const env = {
    asset: (f) => `assets/${f}`,
    siteName: style.site.name,
    nav: (cls) => `<nav class="${cls}" aria-label="${cls === 'footer-nav' ? 'Footer' : 'Main'}"><ul>${style.site.nav.map((n, i) => `<li><a href="${navAnchors[i] || '#'}">${esc(n)}</a></li>`).join('')}</ul></nav>`,
    form: (inner) => `<form class="contact__form" action="#" onsubmit="return false">${inner}</form>`,
  };
  const render = (id) => {
    const content = style.sections[id] || { settings: {} };
    return sections[id].render(staticContext(content.settings, env, content.blocks || []));
  };
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(style.site.name)} — ${esc(style.name)} template (${esc(style.style)})</title>
<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="assets/base.css">
<link rel="stylesheet" href="assets/style.css">
<style>${tokenCss(style)}</style>
</head>
<body class="style-${style.slug}">
${render('header')}
<main>${bodySections.map(render).join('\n')}</main>
${render('footer')}
</body>
</html>
`;
  const files = { 'index.html': html, 'assets/base.css': baseCss(), 'assets/style.css': style.css, 'assets/fonts.css': fontFaceCss(style.slug, (f) => f) };
  for (const f of loadFonts(style.slug)) files[`assets/${f.file}`] = readFileSync(join(FONTS_DIR, f.file));
  for (const [name, svg] of Object.entries(art)) files[`assets/${name}`] = svg;
  return files;
}
