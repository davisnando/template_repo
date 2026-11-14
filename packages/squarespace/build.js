// Squarespace Developer Platform template generator (template.conf + regions + LESS tweaks).
// The homepage is shipped as a static page (pages/home.page) rendered from the shared
// sections; every other page uses the owner's normal Squarespace page content.
import { sections, bodySections } from '../core/sections.js';
import { staticContext, esc } from '../core/context.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { baseCss, colorLabels, fontFaceCss, loadFonts, FONTS_DIR } from '../core/style.js';

const json = (o) => JSON.stringify(o, null, 2) + '\n';

// JSON-T treats `{` as a template tag, so any literal braces in baked content are escaped.
const jsonTSafe = (s) => s.replace(/\{/g, '{.meta-left}').replace(/\}/g, '{.meta-right}');

const NAV = '<squarespace:navigation navigationId="mainNav" template="navigation" />';

function env(style, { siteName }) {
  const visit = style.sections.visit.settings;
  return {
    asset: (f) => `/assets/${f}`,
    siteName,
    nav: (cls) => `<nav class="${cls}" aria-label="${cls === 'footer-nav' ? 'Footer' : 'Main'}">${NAV}</nav>`,
    // Static pages have no form backend; link to email/phone (or swap in a Squarespace form block).
    form: () => `<div class="contact__form contact__cta">
      <a class="btn btn--primary" href="mailto:${esc(visit.email)}">Email ${esc(visit.email)}</a>
      <a class="btn btn--ghost" href="tel:${esc(visit.phone)}">Call ${esc(visit.phone)}</a>
    </div>`,
  };
}

function render(style, id, e) {
  const content = style.sections[id] || { settings: {} };
  return sections[id].render(staticContext(content.settings, e, content.blocks || []));
}

export function buildSquarespace(style, art) {
  // Header/footer live in the region, so the site title comes from Squarespace settings.
  const TITLE = '__SITE_TITLE__';
  const regionEnv = env(style, { siteName: TITLE });
  const region = (id) => jsonTSafe(render(style, id, regionEnv)).replaceAll(TITLE, '{website.siteTitle}');
  const header = region('header');
  const footer = region('footer');

  const site = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/fonts.css">
  <link rel="stylesheet" href="/assets/base.css">
  <link rel="stylesheet" href="/assets/style.css">
  {squarespace-headers}
</head>
<body id="{squarespace.page-id}" class="style-${style.slug} {squarespace.page-classes}">
${header}
<main id="page" role="main">
  {squarespace.main-content}
</main>
${footer}
{squarespace-footers}
</body>
</html>
`;

  const pageEnv = env(style, { siteName: style.site.name });
  const home = bodySections.map((id) => render(style, id, pageEnv)).join('\n');

  // Every colour is a Style Editor tweak; values flow into the shared CSS custom properties.
  const tweaks = Object.entries(colorLabels).map(([k, label]) =>
    `// tweak: { "type": "color", "title": "${label}", "category": "Colors" }\n@${k}: ${style.colors[k]};`).join('\n');
  const less = `${tweaks}

:root {
${Object.keys(colorLabels).map((k) => `  --c-${k.replace(/_/g, '-')}: @${k};`).join('\n')}${style.colors.yellow ? `\n  --c-yellow: ${style.colors.yellow};` : ''}
  --f-head: ~"${style.fonts.head.replace(/"/g, "'")}";
  --f-body: ~"${style.fonts.body.replace(/"/g, "'")}";
}

/* Regular Squarespace pages rendered into {squarespace.main-content} */
#page .sqs-layout { max-width: calc(var(--max) + var(--gutter) * 2); margin: 0 auto; padding: var(--section-pad) var(--gutter); }
#page h1, #page h2, #page h3 { font-family: var(--f-head); }
.sqs-block-button-element { background: var(--c-accent) !important; color: var(--c-accent-text) !important; border-radius: var(--radius-btn); }
`;

  const files = {
    'template.conf': json({
      name: style.name,
      description: `${style.style} template — ${style.tagline}.`,
      author: 'Local Business Templates',
      layouts: { default: { name: 'Default', regions: ['site'] } },
      navigations: [{ title: 'Main Navigation', name: 'mainNav' }],
      stylesheets: ['theme.less'],
      systemCollections: ['album', 'blog', 'events', 'gallery', 'products'],
    }),
    'site.region': site,
    'blocks/navigation.block': `<ul>{.repeated section items}<li{.if active} class="active"{.end}>{.section collection}<a href="{fullUrl}">{navigationTitle}</a>{.end}{.section externalLink}<a href="{url}"{.section newWindow} target="_blank"{.end}>{title}</a>{.end}</li>{.end}</ul>\n`,
    'pages/home.page': `<!-- Homepage generated from packages/core/sections.js — rebuild instead of editing by hand. -->\n${home}\n`,
    'styles/theme.less': less,
    'assets/base.css': baseCss(),
    'assets/style.css': style.css,
    'assets/fonts.css': fontFaceCss(style.slug, (f) => `/assets/${f}`),
  };
  for (const f of loadFonts(style.slug)) files[`assets/${f.file}`] = readFileSync(join(FONTS_DIR, f.file));
  for (const [name, svg] of Object.entries(art)) files[`assets/${name}`] = svg;
  return files;
}
