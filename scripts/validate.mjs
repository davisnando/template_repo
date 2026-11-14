// Structural checks on the generated themes (no network or Shopify CLI needed).
// For a full Shopify lint, also run: npx @shopify/theme-check-node dist/shopify/<style>
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, listStyles } from '../packages/core/style.js';

const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(p, 'utf8');

const PAIRS = [['if', 'endif'], ['unless', 'endunless'], ['for', 'endfor'], ['form', 'endform'], ['paginate', 'endpaginate'], ['schema', 'endschema']];

for (const slug of listStyles()) {
  // ---- Shopify ----
  const sp = join(ROOT, 'dist/shopify', slug);
  for (const req of ['layout/theme.liquid', 'config/settings_schema.json', 'config/settings_data.json', 'templates/index.json', 'locales/en.default.json']) {
    if (!existsSync(join(sp, req))) fail(`${slug}/shopify: missing ${req}`);
  }
  const sectionNames = new Set();
  for (const f of readdirSync(join(sp, 'sections'))) {
    const src = read(join(sp, 'sections', f));
    sectionNames.add(f.replace('.liquid', ''));
    for (const [open, close] of PAIRS) {
      const o = (src.match(new RegExp(`{%-?\\s*${open}\\b`, 'g')) || []).length;
      const c = (src.match(new RegExp(`{%-?\\s*${close}\\b`, 'g')) || []).length;
      if (o !== c) fail(`${slug}/shopify/sections/${f}: ${open} ${o} vs ${close} ${c}`);
    }
    const m = src.match(/{% schema %}([\s\S]*){% endschema %}/);
    if (!m) { fail(`${slug}/shopify/sections/${f}: no schema`); continue; }
    try {
      const schema = JSON.parse(m[1]);
      const ids = new Set();
      for (const s of schema.settings) {
        if (ids.has(s.id)) fail(`${slug}/${f}: duplicate setting ${s.id}`);
        ids.add(s.id);
        if (s.type === 'select' && s.default && !s.options.some((o) => o.value === s.default)) fail(`${slug}/${f}: bad select default ${s.id}`);
        if (s.type === 'image_picker' && 'default' in s) fail(`${slug}/${f}: image_picker cannot have default`);
      }
      for (const out of src.matchAll(/section\.settings\.(\w+)/g)) if (!ids.has(out[1])) fail(`${slug}/${f}: unknown setting ${out[1]}`);
    } catch (e) { fail(`${slug}/shopify/sections/${f}: schema JSON ${e.message}`); }
  }
  for (const f of readdirSync(join(sp, 'templates'))) {
    const t = JSON.parse(read(join(sp, 'templates', f)));
    for (const [key, s] of Object.entries(t.sections)) {
      if (!sectionNames.has(s.type)) fail(`${slug}/templates/${f}: unknown section ${s.type}`);
      if (!t.order.includes(key)) fail(`${slug}/templates/${f}: ${key} not in order`);
    }
  }
  for (const asset of read(join(sp, 'sections/hero.liquid')).matchAll(/'([\w-]+\.svg)' \| asset_url/g)) {
    if (!existsSync(join(sp, 'assets', asset[1]))) fail(`${slug}/shopify: missing asset ${asset[1]}`);
  }

  // ---- Squarespace ----
  const sq = join(ROOT, 'dist/squarespace', slug);
  JSON.parse(read(join(sq, 'template.conf')));
  const region = read(join(sq, 'site.region'));
  for (const tag of ['{squarespace-headers}', '{squarespace-footers}', '{squarespace.main-content}']) {
    if (!region.includes(tag)) fail(`${slug}/squarespace: site.region missing ${tag}`);
  }
  const allowed = /^\{(squarespace[\w.-]*|website\.siteTitle|\.meta-left|\.meta-right)\}$/;
  for (const tag of region.match(/\{[^}\s]*\}/g) || []) if (!allowed.test(tag)) fail(`${slug}/squarespace: unexpected JSON-T tag ${tag}`);
  if (/[{}]/.test(read(join(sq, 'pages/home.page')))) fail(`${slug}/squarespace: braces in home.page`);
  for (const a of read(join(sq, 'pages/home.page')).matchAll(/src="\/assets\/([\w-]+\.svg)"/g)) {
    if (!existsSync(join(sq, 'assets', a[1]))) fail(`${slug}/squarespace: missing asset ${a[1]}`);
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`✓ ${listStyles().length} templates valid for Shopify and Squarespace`);
