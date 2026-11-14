// Shopify Online Store 2.0 theme generator.
import { sections, bodySections } from '../core/sections.js';
import { liquidContext } from '../core/context.js';
import { baseCss, fontsUrl, colorLabels } from '../core/style.js';
import { commerceSections, commerceCss } from './commerce.js';

const json = (o) => JSON.stringify(o, null, 2) + '\n';

/** Converts a shared setting definition into a Shopify schema setting. */
function schemaSetting(def, value) {
  const s = { type: def.type, id: def.id, label: def.label };
  if (def.type === 'select') {
    s.options = def.options.map((o) => ({ value: o, label: o[0].toUpperCase() + o.slice(1) }));
    s.default = value || def.options[0];
  } else if (def.type !== 'image_picker' && value) {
    s.default = value;
  }
  return s;
}

function sectionFile(id, def, content, isStatic) {
  const settings = content?.settings || {};
  const fallbacks = Object.fromEntries(def.settings.filter((s) => s.type === 'image_picker' && settings[s.id]).map((s) => [s.id, settings[s.id]]));
  const markup = def.render(liquidContext('section', fallbacks)).trim();
  const schema = {
    name: def.name,
    tag: 'div',
    class: `shopify-section--${id}`,
    settings: def.settings.map((s) => schemaSetting(s, settings[s.id])),
  };
  if (def.block) {
    schema.max_blocks = def.block.max;
    schema.blocks = [{ type: def.block.type, name: def.block.name, settings: def.block.settings.map((s) => schemaSetting(s)) }];
  }
  if (!isStatic) {
    const preset = { name: def.name };
    if (def.block && content?.blocks) {
      preset.blocks = content.blocks.map((b) => ({ type: def.block.type, settings: stripImages(def.block, b) }));
    }
    schema.presets = [preset];
  }
  return `${markup}\n\n{% schema %}\n${JSON.stringify(schema, null, 2)}\n{% endschema %}\n`;
}

// image_picker values must be Shopify files, so demo images stay as bundled fallbacks.
const stripImages = (defLike, values) =>
  Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== '' && defLike.settings.find((s) => s.id === k && s.type !== 'image_picker')));

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
  }
  return out;
}

const themeLiquid = (style) => `<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="{{ canonical_url }}">
  <title>{{ page_title }}{% unless page_title contains shop.name %} — {{ shop.name }}{% endunless %}</title>
  {%- if page_description -%}<meta name="description" content="{{ page_description | escape }}">{%- endif -%}
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${fontsUrl(style)}">
  {{ 'base.css' | asset_url | stylesheet_tag }}
  {{ 'style.css' | asset_url | stylesheet_tag }}
  <style>
    :root {
${Object.keys(colorLabels).map((k) => `      --c-${k.replace(/_/g, '-')}: {{ settings.color_${k} }};`).join('\n')}${style.colors.yellow ? `\n      --c-yellow: ${style.colors.yellow};` : ''}
      --f-head: ${style.fonts.head};
      --f-body: ${style.fonts.body};
    }
  </style>
  {{ content_for_header }}
</head>
<body class="style-${style.slug} template-{{ template.name }}">
  {% section 'header' %}
  <main id="MainContent" role="main">{{ content_for_layout }}</main>
  {% section 'footer' %}
</body>
</html>
`;

const settingsSchema = (style) => [
  { name: 'theme_info', theme_name: style.name, theme_version: '1.0.0', theme_author: 'Local Business Templates', theme_documentation_url: 'https://github.com', theme_support_url: 'https://github.com' },
  {
    name: 'Colors',
    settings: Object.entries(colorLabels).map(([k, label]) => ({ type: 'color', id: `color_${k}`, label, default: style.colors[k] })),
  },
  {
    name: 'Navigation',
    settings: [{ type: 'link_list', id: 'menu', label: 'Main menu', default: 'main-menu' }],
  },
];

const locale = {
  general: { search: 'Search', cart: 'Cart', add_to_cart: 'Add to cart', sold_out: 'Sold out' },
};

export function buildShopify(style, art) {
  const files = {
    'layout/theme.liquid': themeLiquid(style),
    'config/settings_schema.json': json(settingsSchema(style)),
    'config/settings_data.json': json({ current: 'Default', presets: { Default: {} } }),
    'locales/en.default.json': json(locale),
    'templates/index.json': json(indexTemplate(style)),
    'assets/base.css': baseCss() + '\n' + commerceCss,
    'assets/style.css': style.css,
  };
  for (const [name, svg] of Object.entries(art)) files[`assets/${name}`] = svg;
  for (const [id, def] of Object.entries(sections)) {
    files[`sections/${id}.liquid`] = sectionFile(id, def, style.sections[id], id === 'header' || id === 'footer');
  }
  for (const [name, { liquid, template }] of Object.entries(commerceSections)) {
    files[`sections/${name}.liquid`] = liquid;
    files[`templates/${template}.json`] = json({ sections: { main: { type: name, settings: {} } }, order: ['main'] });
  }
  return files;
}
