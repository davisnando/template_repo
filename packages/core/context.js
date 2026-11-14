// Platform contexts that the shared sections render through.
import { ART_SIZES } from './art.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/** Every UI string used by shared sections, keyed for Shopify's locale file. */
export const translations = {};
const register = (key, en) => { translations[key] = en; return key; };

const dims = (file) => {
  const d = ART_SIZES[file?.replace(/^.*\//, '')];
  return d ? ` width="${d[0]}" height="${d[1]}"` : '';
};

/**
 * Static context: values are baked into the HTML (preview + Squarespace static pages).
 * @param {object} values   settings for this scope
 * @param {object} env      { asset(file), siteName, nav(cls), form(html) }
 */
export function staticContext(values, env, blocks = []) {
  return {
    t: (id) => esc(values[id]),
    text: (id) => esc(values[id]).replace(/\n/g, '<br>'),
    url: (id) => esc(values[id] || '#'),
    opt: (id) => esc(values[id]),
    tr: (key, en) => esc(translations[register(key, en)]),
    img: (id, o = {}) =>
      values[id]
        ? `<img class="${o.cls || ''}" src="${env.asset(values[id])}" alt="${esc(o.alt ? values[o.alt] : '')}"${dims(values[id])}${o.eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`
        : '',
    when: (id, html) => (values[id] ? html : ''),
    attrs: () => '',
    each: (fn) => blocks.map((b) => fn(staticContext(b, env))).join(''),
    scheme: () => '',
    uid: 'static',
    root: '/',
    siteName: esc(env.siteName),
    nav: env.nav,
    form: env.form,
    asset: env.asset,
    year: env.year ?? new Date().getFullYear(),
  };
}

/**
 * Liquid context: emits Shopify Liquid that reads section/block settings.
 * `fallbacks` maps image setting ids to bundled artwork, shown until the merchant
 * uploads their own image.
 */
export function liquidContext(scope, fallbacks = {}) {
  const v = (id) => `${scope}.settings.${id}`;
  const fallbackImg = (src, file, o, loading) =>
    `<img class="${o.cls || ''}" src="${src}" alt=""${dims(file)} loading="${loading}">`;
  return {
    t: (id) => `{{ ${v(id)} | escape }}`,
    text: (id) => `{{ ${v(id)} | escape | newline_to_br }}`,
    url: (id) => `{{ ${v(id)} | default: '#' | escape }}`,
    opt: (id) => `{{ ${v(id)} }}`,
    tr: (key, en) => `{{ '${register(key, en)}' | t }}`,
    img: (id, o = {}) => {
      const loading = o.eager ? 'eager' : 'lazy';
      const priority = o.eager ? ", fetchpriority: 'high'" : '';
      const alt = o.alt ? `, alt: ${v(o.alt)}` : '';
      const uploaded = `{{ ${v(id)} | image_url: width: 2000 | image_tag: class: '${o.cls || ''}', loading: '${loading}'${priority}${alt}, widths: '480, 800, 1200, 1600, 2000', sizes: '${o.sizes || '(min-width: 990px) 50vw, 100vw'}' }}`;
      const fallback =
        scope === 'block'
          ? `{%- assign gallery_index = forloop.index0 | modulo: 4 | plus: 1 -%}` +
            fallbackImg(`{{ settings.style_preset | append: '-gallery-' | append: gallery_index | append: '.svg' | asset_url }}`, 'gallery-1.svg', o, loading)
          : fallbacks[id] ? fallbackImg(`{{ settings.style_preset | append: '-${fallbacks[id]}' | asset_url }}`, fallbacks[id], o, loading) : '';
      return `{%- if ${v(id)} != blank -%}${uploaded}{%- else -%}${fallback}{%- endif -%}`;
    },
    when: (id, html) => `{%- if ${v(id)} != blank -%}${html}{%- endif -%}`,
    attrs: () => (scope === 'block' ? '{{ block.shopify_attributes }}' : ''),
    each: (fn) => `{%- for block in section.blocks -%}${fn(liquidContext('block'))}{%- endfor -%}`,
    scheme: () => ' color-{{ section.settings.color_scheme }}',
    uid: '{{ section.id }}',
    root: '{{ routes.root_url }}',
    siteName: '{{ shop.name | escape }}',
    nav: (cls) =>
      `<nav class="${cls}" aria-label="{{ 'general.navigation' | t }}"><ul>{%- for link in section.settings.menu.links -%}<li><a href="{{ link.url }}"{% if link.active %} aria-current="page"{% endif %}>{{ link.title | escape }}</a></li>{%- endfor -%}</ul></nav>`,
    form: (inner) =>
      `{%- form 'contact', class: 'contact__form' -%}{%- if form.posted_successfully? -%}<p class="form__ok" role="status">{{ 'sections.contact.success' | t }}</p>{%- endif -%}{%- if form.errors -%}<div class="form__errors" role="alert">{{ form.errors | default_errors }}</div>{%- endif -%}${inner}{%- endform -%}`,
    asset: (file) => `{{ '${file}' | asset_url }}`,
    year: "{{ 'now' | date: '%Y' }}",
  };
}
register('sections.contact.success', "Thanks! We'll be in touch shortly.");
