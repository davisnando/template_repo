import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const STYLES_DIR = join(ROOT, 'styles');

export const listStyles = () => readdirSync(STYLES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

export function loadStyle(slug) {
  const dir = join(STYLES_DIR, slug);
  const style = JSON.parse(readFileSync(join(dir, 'style.json'), 'utf8'));
  style.slug = slug;
  style.css = readFileSync(join(dir, 'style.css'), 'utf8');
  return style;
}

export const baseCss = () => readFileSync(join(ROOT, 'packages/core/base.css'), 'utf8');
export const fontsUrl = (style) => `https://fonts.googleapis.com/css2?${style.fonts.google}&display=swap`;

/** Colour keys exposed as editable settings on both platforms. */
export const colorLabels = {
  bg: 'Background', surface: 'Surface', text: 'Text', muted: 'Muted text',
  accent: 'Accent', accent_text: 'Text on accent', border: 'Borders', alt: 'Secondary accent',
};

/** :root token block with fixed values (preview). */
export function tokenCss(style) {
  const colors = Object.entries(style.colors).map(([k, v]) => `--c-${k.replace(/_/g, '-')}: ${v};`).join(' ');
  return `:root { ${colors} --f-head: ${style.fonts.head}; --f-body: ${style.fonts.body}; }`;
}

/** Nav labels are paired with the page anchors used in the demo homepage. */
export const navAnchors = ['#services', '#about', '#gallery', '#visit'];

export const FONTS_DIR = join(ROOT, 'packages/core/fonts');
export const loadFonts = (slug) => JSON.parse(readFileSync(join(STYLES_DIR, slug, 'fonts.json'), 'utf8'));

/** @font-face rules for a template's self-hosted fonts; `url(file)` maps a font file to its served URL. */
export function fontFaceCss(slug, url) {
  return loadFonts(slug)
    .map((f) => `@font-face { font-family: '${f.family}'; font-style: ${f.style}; font-weight: ${f.weight}; font-display: swap; src: url(${url(f.file)}) format('woff2'); unicode-range: ${f.unicodeRange}; }`)
    .join('\n');
}
