// Squarespace 7.1 design kit.
//
// Squarespace 7.1 sites can't be generated as code: a 7.1 template is a finished site
// that is duplicated or transferred to the buyer. This kit holds everything needed to
// build (or restyle) that site quickly and identically:
//   - custom.css      paste into Website → Pages → Custom code → Custom CSS
//   - fonts/          upload as Custom Files, then replace the FONT_URL_* placeholders
//   - images/         artwork as JPG (7.1 image blocks don't accept SVG)
//   - colors + fonts + page content are documented in the template's guide
import { loadFonts } from '../core/style.js';

/** Reads the design tokens a template sets on :root in its style.css. */
export function tokensOf(style) {
  const root = style.css.match(/:root\s*{([^}]*)}/)?.[1] || '';
  const t = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  return {
    radius: t.radius ?? '12px',
    radiusBtn: t['radius-btn'] ?? '999px',
    weight: t['fw-head'] ?? '600',
    case: t['head-case'] ?? 'none',
    track: t['head-track'] ?? '-0.02em',
    lh: t['head-lh'] ?? '1.05',
    border: t['border-w'] ?? '1px',
    shadow: t.shadow && !t.shadow.includes('var(') ? t.shadow : t.shadow ? t.shadow.replace(/var\(--c-text\)/g, style.colors.text) : 'none',
  };
}

/** Maps a template palette onto Squarespace's five-colour Site Styles palette. */
export function sqsPalette(style) {
  const c = style.colors;
  return style.dark
    ? [['Lightest', c.text], ['Light accent', c.muted], ['Accent', c.accent], ['Dark accent', c.surface], ['Darkest', c.bg]]
    : [['Lightest', c.bg], ['Light accent', c.surface], ['Accent', c.accent], ['Dark accent', c.alt], ['Darkest', c.text]];
}

/** Family + font file list, so the guide can say which files to upload. */
export function fontPlan(style) {
  const faces = loadFonts(style.slug);
  const families = [...new Set(faces.map((f) => f.family))];
  return families.map((family, i) => ({ family, placeholder: `FONT_URL_${i + 1}`, files: faces.filter((f) => f.family === family) }));
}

// Personality that can't be expressed as tokens, written against 7.1 markup.
const EXTRAS = {
  atelier: `.header-title-text a { font-size: 1.6rem; }
blockquote, .sqs-block-quote blockquote { font-family: var(--lbt-head); font-size: 1.6rem; line-height: 1.25; }`,
  aurum: `h1, h2, h3 { font-style: italic; }
.header-nav-item a, .sqs-block-button-element { text-transform: uppercase; letter-spacing: .22em; font-size: .74rem; }
.sqs-block-image .fluid-image-container { outline: 1px solid var(--lbt-accent); outline-offset: 14px; }`,
  camellia: `.sqs-block-image .fluid-image-container { border-radius: 500px 500px 4px 4px !important; }
p.sqsrte-small { font-family: var(--lbt-head); font-style: italic; text-transform: none; letter-spacing: 0; font-size: 1.1rem; }`,
  folio: `h1 { font-size: clamp(4rem, 13vw, 12rem); }
h1::after { content: "."; color: var(--lbt-accent); }
.page-section { border-top: 1px solid var(--lbt-text); }`,
  marigold: `.sqs-block-button-element { box-shadow: 0 5px 0 rgb(0 0 0 / .25); font-weight: 800; }
.sqs-block-image .fluid-image-container { border-radius: 40px !important; transform: rotate(-2deg); box-shadow: 14px 14px 0 var(--lbt-alt); }`,
  meridian: `.sqs-block-button-element { box-shadow: 0 10px 24px -12px rgb(37 96 214 / .6); }
p.sqsrte-small { display: inline-block; padding: .45em .9em; border-radius: 999px; background: color-mix(in srgb, var(--lbt-accent) 10%, white); }`,
  monolith: `.sqs-block-button-element, .sqs-block-image .fluid-image-container, .form-wrapper { border: 3px solid var(--lbt-text) !important; box-shadow: 8px 8px 0 var(--lbt-text) !important; }
.header { border-bottom: 3px solid var(--lbt-text); }
p.sqsrte-small { display: inline-block; background: var(--lbt-text); color: #FFE600 !important; padding: .35em .7em; }`,
  nebula: `body { background: radial-gradient(1200px 600px at 80% -10%, rgb(139 92 246 / .22), transparent 60%), radial-gradient(900px 500px at 0% 20%, rgb(79 240 255 / .10), transparent 60%), var(--lbt-bg); background-attachment: fixed; }
h1 { background: linear-gradient(180deg, #fff 30%, #9aa3c7); -webkit-background-clip: text; background-clip: text; color: transparent !important; }
.sqs-block-button-element { box-shadow: 0 0 0 1px rgb(79 240 255 / .4), 0 8px 30px -6px rgb(79 240 255 / .6); }
p.sqsrte-small { font-family: ui-monospace, monospace; text-transform: none; }`,
  pulse: `.sqs-block-button-element { clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%); text-transform: uppercase; font-weight: 800; }
.header-nav-item a { text-transform: uppercase; font-weight: 700; letter-spacing: .06em; }`,
  sundown: `body::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: .25; mix-blend-mode: multiply; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E"); }
h1 { color: #E0582B !important; text-shadow: 3px 3px 0 var(--lbt-alt), 6px 6px 0 var(--lbt-text); }
.sqs-block-button-element { border: 2px solid var(--lbt-text) !important; box-shadow: 4px 4px 0 var(--lbt-text); }`,
  terroir: `body::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: .22; mix-blend-mode: multiply; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E"); }
.sqs-block-image .fluid-image-container { border-radius: 300px 300px 6px 6px !important; }`,
  tessera: `.sqs-block-image .fluid-image-container, .form-wrapper { border-radius: 26px !important; }
.header .header-inner { margin: 12px; border: 1px solid var(--lbt-border); border-radius: 999px; background: #fff; }
p.sqsrte-small::before { content: "✦ "; color: var(--lbt-accent); }`,
};

export function buildSquarespace71(style) {
  const t = tokensOf(style);
  const c = style.colors;
  const fonts = fontPlan(style);
  const fontFace = fonts.flatMap((f) => f.files.map((file) =>
    `@font-face { font-family: '${f.family}'; font-style: ${file.style}; font-weight: ${file.weight}; font-display: swap; src: url('${f.placeholder}') format('woff2'); }`,
  )).join('\n');
  const css = `/* ${style.name} — ${style.style} · Squarespace 7.1 custom CSS
   1. Upload the files in /fonts via "Manage custom files" in this editor.
   2. Replace each FONT_URL_n below with the URL of the matching file
      (click the uploaded file to insert its URL). See the guide for the mapping.
   Generated from styles/${style.slug}; edit there and rebuild instead of here. */

${fontFace}

:root {
  --lbt-bg: ${c.bg}; --lbt-surface: ${c.surface}; --lbt-text: ${c.text}; --lbt-muted: ${c.muted};
  --lbt-accent: ${c.accent}; --lbt-accent-text: ${c.accent_text}; --lbt-border: ${c.border}; --lbt-alt: ${c.alt};
  --lbt-head: ${style.fonts.head}; --lbt-body: ${style.fonts.body};
}

/* Typography */
body, p, li, input, textarea, select, .sqs-block-button-element { font-family: var(--lbt-body) !important; }
h1, h2, h3, h4, .header-title-text a { font-family: var(--lbt-head) !important; font-weight: ${t.weight} !important; letter-spacing: ${t.track}; line-height: ${t.lh}; text-transform: ${t.case}; }
/* "Paragraph 3" doubles as the small label above headings */
p.sqsrte-small { text-transform: uppercase; letter-spacing: .16em; font-weight: 600; color: var(--lbt-accent) !important; }

/* Buttons */
.sqs-block-button-element, .sqs-button-element--primary, .header-actions .btn {
  border-radius: ${t.radiusBtn} !important; transition: transform .2s, box-shadow .2s;
}
.sqs-block-button-element:hover { transform: translateY(-2px); }

/* Images, cards and forms */
.sqs-block-image .fluid-image-container, .sqs-block-image img, .summary-thumbnail-container, .list-item-media-inner { border-radius: ${t.radius}; overflow: hidden; }
.form-wrapper input, .form-wrapper textarea, .form-wrapper select { border-radius: calc(${t.radius} / 2) !important; border-width: ${t.border} !important; }
${t.shadow !== 'none' ? `.sqs-block-image .fluid-image-container, .user-items-list .list-item { box-shadow: ${t.shadow}; }\n` : ''}
/* Header */
.header-nav-item a { font-size: .95rem; }

/* Accessibility: visible keyboard focus */
a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--lbt-accent) !important; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }

/* ${style.name} details */
${EXTRAS[style.slug] || ''}
`;
  return { css, fonts };
}
