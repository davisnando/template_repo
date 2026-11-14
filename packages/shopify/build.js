// Shopify Online Store 2.0 theme generator.
//
// Every build is the same complete theme ("Local") containing all templates as
// theme-setting presets. A per-template build only changes which preset is active
// and which demo content the homepage, header and footer start with.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sections, bodySections } from '../core/sections.js';
import { liquidContext, translations } from '../core/context.js';
import { artworkFor } from '../core/art.js';
import { baseCss, colorLabels, listStyles, loadStyle, loadFonts, fontFaceCss, FONTS_DIR } from '../core/style.js';
import { scopeCss } from './scope-css.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const THEME_DIR = join(HERE, 'theme');
const json = (o) => JSON.stringify(o, null, 2) + '\n';

export const THEME_NAME = 'Local';
const VERSION = '1.0.0';
const AUTHOR = 'Local Business Templates';
const DOCS_URL = 'https://github.com/davisnando/template_repo#readme';
const SUPPORT_URL = 'https://github.com/davisnando/template_repo/issues';

// ---------------------------------------------------------------- helpers

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const isImage = (def) => def.type === 'image_picker';
const stripImages = (def, values = {}) =>
  Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== '' && def.settings.some((s) => s.id === k && !isImage(s))));

/** Shared setting → Shopify schema setting. */
function schemaSetting(def, value) {
  const s = { type: def.type, id: def.id, label: def.label };
  if (def.type === 'select') {
    s.options = def.options.map((o) => ({ value: o, label: o[0].toUpperCase() + o.slice(1) }));
    s.default = value || def.options[0];
  } else if (!isImage(def) && value) {
    s.default = value;
  }
  return s;
}

/** Shared body section → Liquid file with schema. Defaults come from `content`. */
function sectionFile(id, def, content) {
  const settings = content?.settings || {};
  const fallbacks = Object.fromEntries(def.settings.filter((s) => isImage(s) && settings[s.id]).map((s) => [s.id, settings[s.id]]));
  const markup = def.render(liquidContext('section', fallbacks)).trim();
  const schema = {
    name: def.name,
    tag: 'div',
    class: `section-${id}`,
    disabled_on: { groups: ['header', 'footer'] },
    settings: [
      ...def.settings.map((s) => schemaSetting(s, settings[s.id])),
      { type: 'color_scheme', id: 'color_scheme', label: 'Color scheme', default: 'scheme-1' },
    ],
  };
  const preset = { name: def.name };
  if (def.block) {
    schema.max_blocks = def.block.max;
    schema.blocks = [{ type: def.block.type, name: def.block.name, settings: def.block.settings.map((s) => schemaSetting(s)) }];
    if (content?.blocks) preset.blocks = content.blocks.map((b) => ({ type: def.block.type, settings: stripImages(def.block, b) }));
  }
  schema.presets = [preset];
  return `${markup}\n\n{% schema %}\n${JSON.stringify(schema, null, 2)}\n{% endschema %}\n`;
}

// ---------------------------------------------------------------- generated files

const schemeDefinition = Object.entries(colorLabels).map(([k, label]) => ({ type: 'color', id: k, label, default: '#000000' }));

function schemesFor(style) {
  const c = style.colors;
  return {
    // 1: the template's main palette
    'scheme-1': { settings: { ...c } },
    // 2: tinted surface, used for alternating bands
    'scheme-2': { settings: { ...c, bg: c.surface, surface: c.bg } },
    // 3: inverse, used for announcement bars and footers
    'scheme-3': { settings: { ...c, bg: c.text, surface: c.text, text: c.bg, muted: c.border, border: c.muted } },
  };
}

function settingsSchema(styles, current) {
  return [
    { name: 'theme_info', theme_name: THEME_NAME, theme_version: VERSION, theme_author: AUTHOR, theme_documentation_url: DOCS_URL, theme_support_url: SUPPORT_URL },
    {
      name: 'Style',
      settings: [
        { type: 'select', id: 'style_preset', label: 'Design style', info: 'Changes typography, shapes and placeholder artwork. Colors are set per color scheme.', options: styles.map((s) => ({ value: s.slug, label: `${s.name} (${s.style})` })), default: current.slug },
        { type: 'image_picker', id: 'favicon', label: 'Favicon', info: '32 × 32 px' },
      ],
    },
    {
      name: 'Colors',
      settings: [{
        type: 'color_scheme_group', id: 'color_schemes',
        definition: schemeDefinition,
        role: {
          background: 'bg', text: 'text', primary_button: 'accent', on_primary_button: 'accent_text', primary_button_border: 'accent',
          secondary_button: 'bg', on_secondary_button: 'text', secondary_button_border: 'text', links: 'accent', icons: 'text',
        },
      }],
    },
    {
      name: 'Search',
      settings: [{ type: 'checkbox', id: 'predictive_search_enabled', label: 'Enable search suggestions', default: true }],
    },
    {
      name: 'Cart',
      settings: [{ type: 'checkbox', id: 'show_cart_note', label: 'Enable cart note', default: true }],
    },
    {
      name: 'Social media',
      settings: ['instagram', 'facebook', 'tiktok', 'x', 'youtube', 'pinterest', 'linkedin'].map((n) => ({
        type: 'text', id: `social_${n}_link`, label: n === 'x' ? 'X (Twitter)' : n[0].toUpperCase() + n.slice(1), info: `https://${n === 'x' ? 'x' : n}.com/…`,
      })),
    },
  ];
}

function presetSettings(style) {
  const settings = { style_preset: style.slug, color_schemes: schemesFor(style), predictive_search_enabled: true, show_cart_note: true };
  const f = style.sections.footer.settings;
  for (const url of [f.instagram, f.facebook]) {
    const network = url?.match(/(instagram|facebook|tiktok|pinterest|linkedin|youtube)/)?.[1];
    if (network) settings[`social_${network}_link`] = url;
  }
  return settings;
}

function settingsData(styles, current) {
  return { current: current.name, presets: Object.fromEntries(styles.map((s) => [s.name, presetSettings(s)])) };
}

/** Fonts, font variables and color-scheme custom properties. */
function themeStylesSnippet(styles) {
  const fontCases = styles.map((s) => {
    const faces = fontFaceCss(s.slug, (file) => `{{ '${file}' | asset_url }}`);
    const extra = s.colors.yellow ? ` --c-yellow: ${s.colors.yellow};` : '';
    return `  {%- when '${s.slug}' -%}\n${faces}\n:root { --f-head: ${s.fonts.head}; --f-body: ${s.fonts.body};${extra} }`;
  }).join('\n');
  const vars = Object.keys(colorLabels).map((k) => `    --c-${k.replace(/_/g, '-')}: {{ scheme.settings.${k} }};`).join('\n');
  return `{%- comment -%} Generated by packages/shopify/build.js {%- endcomment -%}
{%- style -%}
{%- case settings.style_preset -%}
${fontCases}
{%- endcase -%}
{%- for scheme in settings.color_schemes -%}
  {%- if forloop.index == 1 %}:root, {% endif -%}
  .color-{{ scheme.id }} {
${vars}
  }
  .color-{{ scheme.id }}:not(:root) { background-color: var(--c-bg); color: var(--c-text); }
{%- endfor -%}
{%- endstyle -%}
`;
}

function indexTemplate(style) {
  const out = { sections: {}, order: [] };
  for (const id of bodySections) {
    const def = sections[id];
    const content = style.sections[id];
    const entry = { type: id, settings: stripImages(def, content.settings) };
    if (def.block) {
      entry.blocks = {};
      entry.block_order = [];
      (content.blocks || []).forEach((b, i) => {
        const key = `${def.block.type}_${i + 1}`;
        entry.blocks[key] = { type: def.block.type, settings: stripImages(def.block, b) };
        entry.block_order.push(key);
      });
    }
    out.sections[id] = entry;
    out.order.push(id);
    if (id === 'services') {
      // Shop-ready but off by default: most local businesses start without products.
      out.sections.featured_collection = { type: 'featured-collection', disabled: true, settings: {} };
      out.order.push('featured_collection');
    }
  }
  return out;
}

function headerGroup(style) {
  const h = style.sections.header.settings;
  const sectionsJson = {
    header: { type: 'header', settings: { cta_label: h.cta_label || '', menu: 'main-menu', sticky: true, color_scheme: 'scheme-1' } },
  };
  const order = ['header'];
  if (h.announcement) {
    sectionsJson.announcement = {
      type: 'announcement-bar',
      blocks: { announcement_1: { type: 'announcement', settings: { text: h.announcement } } },
      block_order: ['announcement_1'],
      settings: { color_scheme: 'scheme-3' },
    };
    order.unshift('announcement');
  }
  return { type: 'header', name: 'Header group', sections: sectionsJson, order };
}

function footerGroup(style) {
  const f = style.sections.footer.settings;
  const visit = style.sections.visit;
  const hours = (visit.blocks || []).map((b) => `${b.day}: ${b.time}`).join('<br>');
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return {
    type: 'footer',
    name: 'Footer group',
    sections: {
      footer: {
        type: 'footer',
        blocks: {
          brand: { type: 'brand', settings: { text: `<p>${esc(f.tagline)}</p>`, show_social: true } },
          visit: { type: 'text', settings: { heading: 'Visit', text: `<p>${esc(visit.settings.address).replace(/\n/g, '<br>')}<br>${esc(visit.settings.phone)}</p>` } },
          hours: { type: 'text', settings: { heading: 'Hours', text: `<p>${esc(hours).replace(/&lt;br>/g, '<br>')}</p>` } },
          newsletter: { type: 'newsletter', settings: { heading: 'Newsletter' } },
        },
        block_order: ['brand', 'visit', 'hours', 'newsletter'],
        settings: { color_scheme: 'scheme-3', show_country: true, show_language: true, show_payment_icons: true, show_policies: true },
      },
    },
    order: ['footer'],
  };
}

/** Merges UI strings used by the shared sections into the static locale file. */
function localeFile() {
  const locale = JSON.parse(readFileSync(join(THEME_DIR, 'locales/en.default.json'), 'utf8'));
  for (const [key, en] of Object.entries(translations)) {
    const parts = key.split('.');
    let node = locale;
    for (const p of parts.slice(0, -1)) node = node[p] ??= {};
    node[parts.at(-1)] ??= en;
  }
  return json(locale);
}

// ---------------------------------------------------------------- build

/**
 * @param {object} current   the template whose preset is active and whose demo content is used
 * @param {object} [opts]    { name } overrides the theme name (Theme Store submission uses "Local")
 */
export function buildShopify(current, _art, opts = {}) {
  const styles = listStyles().map(loadStyle);
  const files = {};

  // Hand-written theme files
  for (const path of walk(THEME_DIR)) files[relative(THEME_DIR, path)] = readFileSync(path);

  // Shared body sections (hero, services, …) — header/footer are Shopify-specific above.
  for (const id of bodySections) files[`sections/${id}.liquid`] = sectionFile(id, sections[id], current.sections[id]);

  // Styles, fonts and artwork for every preset
  files['assets/base.css'] = `${baseCss()}\n${readFileSync(join(HERE, 'commerce.css'), 'utf8')}`;
  files['assets/presets.css'] = styles.map((s) => `/* ${s.name} — ${s.style} */\n${scopeCss(s.css, `.style-${s.slug}`)}`).join('\n');
  for (const s of styles) {
    for (const f of loadFonts(s.slug)) files[`assets/${f.file}`] = readFileSync(join(FONTS_DIR, f.file));
    for (const [name, svg] of Object.entries(artworkFor(s.motif, s.colors, s.dark))) files[`assets/${s.slug}-${name}`] = svg;
  }
  files['snippets/theme-styles.liquid'] = themeStylesSnippet(styles);

  // Settings, presets and demo content
  const schema = settingsSchema(styles, current);
  schema[0].theme_name = opts.name ?? current.name;
  files['config/settings_schema.json'] = json(schema);
  files['config/settings_data.json'] = json(settingsData(styles, current));
  files['templates/index.json'] = json(indexTemplate(current));
  files['sections/header-group.json'] = json(headerGroup(current));
  files['sections/footer-group.json'] = json(footerGroup(current));
  files['locales/en.default.json'] = localeFile();
  return files;
}
