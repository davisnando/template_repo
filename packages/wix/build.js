// Wix Studio design kit.
//
// Wix sites (and Wix templates) are built in the Wix Studio / Wix Editor and can't be
// imported as code. The kit holds everything needed to build a template site that
// matches the design exactly:
//   - global.css   Wix Studio → Code → CSS (global.css). Styles elements by custom class.
//   - fonts/       Upload under Site Styles → Text → Upload fonts.
//   - images/      Artwork as JPG.
//   - the guide (Documentation.html) maps colours, text themes, classes and content.
import { tokensOf, fontPlan } from '../squarespace71/build.js';

/** Custom classes the guide tells the builder to add in the Wix Studio CSS panel. */
export const WIX_CLASSES = [
  ['lbt-eyebrow', 'Small text above headings'],
  ['lbt-btn', 'Primary buttons'],
  ['lbt-btn-ghost', 'Secondary (outline) buttons'],
  ['lbt-card', 'Service and review containers'],
  ['lbt-image', 'Images and image containers'],
  ['lbt-section-alt', 'Sections that use the alternate (surface) background'],
  ['lbt-section-inverse', 'Dark/inverse sections such as the footer'],
];

/** Wix Studio theme colours. Names follow Site Styles → Colors. */
export function wixPalette(style) {
  const c = style.colors;
  return [
    ['Background', c.bg], ['Secondary background', c.surface], ['Primary text', c.text], ['Secondary text', c.muted],
    ['Accent 1 (buttons, links)', c.accent], ['Text on accent', c.accent_text], ['Accent 2', c.alt], ['Lines and borders', c.border],
  ];
}

const EXTRA = {
  aurum: '.lbt-btn, .lbt-btn-ghost { text-transform: uppercase; letter-spacing: .22em; }\n.lbt-image { outline: 1px solid var(--lbt-accent); outline-offset: 14px; }',
  camellia: '.lbt-image { border-radius: 500px 500px 4px 4px; }',
  marigold: '.lbt-image { border-radius: 40px; box-shadow: 14px 14px 0 var(--lbt-alt); }',
  monolith: '.lbt-btn, .lbt-btn-ghost, .lbt-card, .lbt-image { border: 3px solid var(--lbt-text); box-shadow: 8px 8px 0 var(--lbt-text); }\n.lbt-eyebrow { background: var(--lbt-text); color: #FFE600; padding: .35em .7em; }',
  nebula: '.lbt-btn { box-shadow: 0 0 0 1px rgb(79 240 255 / .4), 0 8px 30px -6px rgb(79 240 255 / .6); }\n.lbt-card { background: rgb(255 255 255 / .04); backdrop-filter: blur(12px); }',
  pulse: '.lbt-btn, .lbt-btn-ghost { clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%); text-transform: uppercase; }',
  sundown: '.lbt-btn, .lbt-btn-ghost, .lbt-card { border: 2px solid var(--lbt-text); box-shadow: 4px 4px 0 var(--lbt-text); }',
  terroir: '.lbt-image { border-radius: 300px 300px 6px 6px; }',
  tessera: '.lbt-card, .lbt-image { border-radius: 26px; }',
};

export function buildWix(style) {
  const t = tokensOf(style);
  const c = style.colors;
  const css = `/* ${style.name} — ${style.style} · Wix Studio global.css
   Add the custom classes below to elements in the CSS panel (see the guide).
   Generated from styles/${style.slug}; edit there and rebuild instead of here. */

:root {
  --lbt-bg: ${c.bg}; --lbt-surface: ${c.surface}; --lbt-text: ${c.text}; --lbt-muted: ${c.muted};
  --lbt-accent: ${c.accent}; --lbt-accent-text: ${c.accent_text}; --lbt-border: ${c.border}; --lbt-alt: ${c.alt};
}

.lbt-eyebrow { text-transform: uppercase; letter-spacing: .16em; font-weight: 600; color: var(--lbt-accent); }
.lbt-btn { background: var(--lbt-accent); color: var(--lbt-accent-text); border-radius: ${t.radiusBtn}; transition: transform .2s; }
.lbt-btn-ghost { background: transparent; color: var(--lbt-text); border: ${t.border} solid currentColor; border-radius: ${t.radiusBtn}; transition: transform .2s; }
.lbt-btn:hover, .lbt-btn-ghost:hover { transform: translateY(-2px); }
.lbt-card { background: var(--lbt-surface); border: ${t.border} solid var(--lbt-border); border-radius: ${t.radius};${t.shadow !== 'none' ? ` box-shadow: ${t.shadow};` : ''} }
.lbt-image { border-radius: ${t.radius}; overflow: hidden; }
.lbt-section-alt { background: var(--lbt-surface); }
.lbt-section-inverse { background: var(--lbt-text); color: var(--lbt-bg); }

@media (prefers-reduced-motion: reduce) { .lbt-btn, .lbt-btn-ghost { transition: none; } }

/* ${style.name} details */
${EXTRA[style.slug] || ''}
`;
  return { css, fonts: fontPlan(style), heading: { weight: t.weight, case: t.case, track: t.track } };
}
