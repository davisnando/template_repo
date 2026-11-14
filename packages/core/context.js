// Platform contexts that the shared sections render through.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

/**
 * Static context: values are baked into the HTML (preview + Squarespace static pages).
 * @param {object} values   settings for this scope
 * @param {object} env      { asset(file), siteName, nav(cls), form(html), blocks }
 */
export function staticContext(values, env, blocks = []) {
  const c = {
    t: (id) => esc(values[id]),
    text: (id) => esc(values[id]).replace(/\n/g, '<br>'),
    url: (id) => esc(values[id] || '#'),
    opt: (id) => esc(values[id]),
    img: (id, o = {}) =>
      values[id]
        ? `<img class="${o.cls || ''}" src="${env.asset(values[id])}" alt="${esc(values[`${id}_alt`] || '')}"${o.eager ? '' : ' loading="lazy"'}>`
        : '',
    when: (id, html) => (values[id] ? html : ''),
    attrs: () => '',
    each: (fn) => blocks.map((b) => fn(staticContext(b, env))).join(''),
    siteName: esc(env.siteName),
    nav: env.nav,
    form: env.form,
    asset: env.asset,
    year: env.year ?? new Date().getFullYear(),
  };
  return c;
}

/**
 * Liquid context: emits Shopify Liquid that reads section/block settings.
 * `fallbacks` maps image setting ids to bundled asset filenames, used until the
 * merchant uploads their own image.
 */
export function liquidContext(scope, fallbacks = {}, blockFallbacks = []) {
  const v = (id) => `${scope}.settings.${id}`;
  const c = {
    t: (id) => `{{ ${v(id)} | escape }}`,
    text: (id) => `{{ ${v(id)} | escape | newline_to_br }}`,
    url: (id) => `{{ ${v(id)} | default: '#' | escape }}`,
    opt: (id) => `{{ ${v(id)} }}`,
    img: (id, o = {}) => {
      const fb = scope === 'block' ? null : fallbacks[id];
      const loading = o.eager ? "'eager'" : "'lazy'";
      const uploaded = `{{ ${v(id)} | image_url: width: 2000 | image_tag: class: '${o.cls || ''}', loading: ${loading}, widths: '480, 800, 1200, 1600, 2000', sizes: '(min-width: 990px) 50vw, 100vw' }}`;
      const fallback =
        scope === 'block'
          ? `<img class="${o.cls || ''}" src="{{ 'gallery-' | append: forloop.index | append: '.svg' | asset_url }}" alt="" loading="lazy">`
          : fb
            ? `<img class="${o.cls || ''}" src="{{ '${fb}' | asset_url }}" alt="" loading=${loading}>`
            : '';
      return `{%- if ${v(id)} != blank -%}${uploaded}{%- else -%}${fallback}{%- endif -%}`;
    },
    when: (id, html) => `{%- if ${v(id)} != blank -%}${html}{%- endif -%}`,
    attrs: () => (scope === 'block' ? '{{ block.shopify_attributes }}' : ''),
    each: (fn) => `{%- for block in section.blocks -%}${fn(liquidContext('block'))}{%- endfor -%}`,
    siteName: '{{ shop.name | escape }}',
    nav: (cls) =>
      `<nav class="${cls}" aria-label="Main"><ul>{%- for link in linklists[settings.menu].links -%}<li><a href="{{ link.url }}"{% if link.active %} aria-current="page"{% endif %}>{{ link.title | escape }}</a></li>{%- endfor -%}</ul></nav>`,
    form: (inner) =>
      `{%- form 'contact', class: 'contact__form' -%}{%- if form.posted_successfully? -%}<p class="form__ok">Thanks! We'll be in touch shortly.</p>{%- endif -%}{{ form.errors | default_errors }}${inner}{%- endform -%}`,
    asset: (file) => `{{ '${file}' | asset_url }}`,
    year: "{{ 'now' | date: '%Y' }}",
  };
  return c;
}
