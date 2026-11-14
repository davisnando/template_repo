// Structural checks on the generated themes that Theme Check doesn't cover.
// Run Shopify's linter as well: node scripts/theme-check.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, listStyles } from '../packages/core/style.js';

const errors = [];
const fail = (msg) => errors.push(msg);
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));

// Templates every Theme Store theme must provide.
const REQUIRED = [
  'layout/theme.liquid', 'layout/password.liquid', 'config/settings_schema.json', 'config/settings_data.json', 'locales/en.default.json',
  'templates/index.json', 'templates/product.json', 'templates/collection.json', 'templates/list-collections.json', 'templates/search.json',
  'templates/cart.json', 'templates/page.json', 'templates/page.contact.json', 'templates/blog.json', 'templates/article.json',
  'templates/404.json', 'templates/password.json', 'templates/gift_card.liquid',
  'templates/customers/account.json', 'templates/customers/activate_account.json', 'templates/customers/addresses.json',
  'templates/customers/login.json', 'templates/customers/order.json', 'templates/customers/register.json', 'templates/customers/reset_password.json',
  'sections/header-group.json', 'sections/footer-group.json',
];
const slugs = listStyles();

for (const theme of readdirSync(join(ROOT, 'dist/shopify'))) {
  const dir = join(ROOT, 'dist/shopify', theme);
  const tag = `shopify/${theme}`;
  for (const f of REQUIRED) if (!existsSync(join(dir, f))) fail(`${tag}: missing ${f}`);

  const sectionTypes = new Set(readdirSync(join(dir, 'sections')).filter((f) => f.endsWith('.liquid')).map((f) => f.slice(0, -7)));
  const jsonFiles = [...walk(join(dir, 'templates')).filter((f) => f.endsWith('.json')), join(dir, 'sections/header-group.json'), join(dir, 'sections/footer-group.json')];
  for (const f of jsonFiles) {
    const t = JSON.parse(read(f));
    for (const [key, s] of Object.entries(t.sections)) {
      if (!sectionTypes.has(s.type)) fail(`${tag}: ${f.split(theme + '/')[1]} uses unknown section ${s.type}`);
      if (!t.order.includes(key)) fail(`${tag}: ${f.split(theme + '/')[1]} section ${key} missing from order`);
    }
  }

  // Every preset needs its artwork and font files, and every scheme a section can default to.
  const data = JSON.parse(read(join(dir, 'config/settings_data.json')));
  if (!data.presets[data.current]) fail(`${tag}: current preset "${data.current}" does not exist`);
  for (const [name, preset] of Object.entries(data.presets)) {
    for (const scheme of ['scheme-1', 'scheme-2', 'scheme-3']) if (!preset.color_schemes?.[scheme]) fail(`${tag}: preset ${name} lacks ${scheme}`);
    for (const art of ['hero.svg', 'about.svg', 'map.svg', 'gallery-1.svg', 'gallery-4.svg']) {
      if (!existsSync(join(dir, 'assets', `${preset.style_preset}-${art}`))) fail(`${tag}: preset ${name} missing ${art}`);
    }
  }
  const styles = read(join(dir, 'snippets/theme-styles.liquid'));
  for (const m of styles.matchAll(/'([\w.-]+\.woff2)' \| asset_url/g)) if (!existsSync(join(dir, 'assets', m[1]))) fail(`${tag}: missing font ${m[1]}`);
  for (const slug of slugs) if (!styles.includes(`when '${slug}'`)) fail(`${tag}: no font rules for ${slug}`);
  const presetsCss = read(join(dir, 'assets/presets.css'));
  for (const slug of slugs) if (!presetsCss.includes(`.style-${slug}`)) fail(`${tag}: no preset CSS for ${slug}`);
  // No third-party asset hosts (fonts and images ship with the theme).
  for (const f of walk(dir).filter((f) => /\.(liquid|css|js)$/.test(f))) {
    if (/fonts\.googleapis|fonts\.gstatic/.test(read(f))) fail(`${tag}: ${f.split(theme + '/')[1]} loads Google Fonts remotely`);
  }
}

for (const slug of slugs) {
  const sq = join(ROOT, 'dist/squarespace', slug);
  JSON.parse(read(join(sq, 'template.conf')));
  const region = read(join(sq, 'site.region'));
  for (const tag of ['{squarespace-headers}', '{squarespace-footers}', '{squarespace.main-content}']) {
    if (!region.includes(tag)) fail(`squarespace/${slug}: site.region missing ${tag}`);
  }
  const allowed = /^\{(squarespace[\w.-]*|website\.siteTitle|\.meta-left|\.meta-right)\}$/;
  for (const tag of region.match(/\{[^}\s]*\}/g) || []) if (!allowed.test(tag)) fail(`squarespace/${slug}: unexpected JSON-T tag ${tag}`);
  const home = read(join(sq, 'pages/home.page'));
  if (/[{}]/.test(home)) fail(`squarespace/${slug}: braces in home.page`);
  for (const a of home.matchAll(/src="\/assets\/([\w-]+\.svg)"/g)) if (!existsSync(join(sq, 'assets', a[1]))) fail(`squarespace/${slug}: missing asset ${a[1]}`);
  for (const f of read(join(sq, 'assets/fonts.css')).matchAll(/url\(\/assets\/([\w.-]+)\)/g)) if (!existsSync(join(sq, 'assets', f[1]))) fail(`squarespace/${slug}: missing font ${f[1]}`);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`✓ ${readdirSync(join(ROOT, 'dist/shopify')).length} Shopify themes and ${slugs.length} Squarespace templates valid`);
