// Builds sale-ready packages for every template into dist/release/.
//   node scripts/release.mjs            (requires release.config.json to be filled in)
//   node scripts/release.mjs --draft    (allows placeholder brand/contact details)
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, listStyles, loadStyle, FONTS_DIR } from '../packages/core/style.js';
import { artworkFor, ART_SIZES } from '../packages/core/art.js';
import { buildSquarespace71 } from '../packages/squarespace71/build.js';
import { buildWix } from '../packages/wix/build.js';
import { documentationHtml, licenseText, changelog, listing } from '../packages/release/docs.js';

const cfg = JSON.parse(readFileSync(join(ROOT, 'release.config.json'), 'utf8'));
const draft = process.argv.includes('--draft');
if (!draft && /example\.com/.test(cfg.website + cfg.supportEmail)) {
  console.error('release.config.json still has example.com placeholders. Fill in your website and support email, or run with --draft.');
  process.exit(1);
}
for (const slug of listStyles()) {
  if (!existsSync(join(ROOT, 'dist/shopify', slug)) || !existsSync(join(ROOT, 'screenshots', slug, 'desktop.png'))) {
    console.error(`Missing build or screenshots for ${slug}. Run: npm run build && npm run screenshots`);
    process.exit(1);
  }
}

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const zip = (cwd, out) => { rmSync(out, { force: true }); execFileSync('zip', ['-qr', '-X', out, '.'], { cwd }); };
const out = join(ROOT, 'dist/release');
rmSync(out, { recursive: true, force: true });

async function svgToJpg(svg, [w, h], file) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg style="display:block;width:${w}px;height:${h}px" `)}</body></html>`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 88 });
  await page.close();
}

for (const slug of listStyles()) {
  const style = loadStyle(slug);
  const dir = join(out, style.name);
  const tmp = join(out, '.tmp', slug);
  mkdirSync(dir, { recursive: true });

  // Shopify theme
  zip(join(ROOT, 'dist/shopify', slug), join(dir, `${style.name}-Shopify-Theme.zip`));

  // Squarespace 7.0 Developer Platform template
  zip(join(ROOT, 'dist/squarespace', slug), join(dir, `${style.name}-Squarespace-7.0-Template.zip`));

  // Squarespace 7.1 kit: CSS, fonts, JPG artwork
  const kit = join(tmp, 'kit');
  mkdirSync(join(kit, 'fonts'), { recursive: true });
  mkdirSync(join(kit, 'images'), { recursive: true });
  const { css, fonts } = buildSquarespace71(style);
  writeFileSync(join(kit, 'custom.css'), css);
  for (const f of fonts.flatMap((x) => x.files)) cpSync(join(FONTS_DIR, f.file), join(kit, 'fonts', f.file));
  for (const [name, svg] of Object.entries(artworkFor(style.motif, style.colors, style.dark))) {
    await svgToJpg(svg, ART_SIZES[name], join(kit, 'images', name.replace('.svg', '.jpg')));
  }
  writeFileSync(join(kit, 'README.txt'), `${style.name} — Squarespace 7.1 kit\nFollow "Squarespace 7.1 setup" in Documentation.html.\n`);
  zip(kit, join(dir, `${style.name}-Squarespace-7.1-Kit.zip`));

  // Wix Studio kit: same fonts and artwork, Wix-specific CSS
  const wix = join(tmp, 'wix');
  cpSync(join(kit, 'fonts'), join(wix, 'fonts'), { recursive: true });
  cpSync(join(kit, 'images'), join(wix, 'images'), { recursive: true });
  writeFileSync(join(wix, 'global.css'), buildWix(style).css);
  writeFileSync(join(wix, 'README.txt'), `${style.name} — Wix Studio kit\nFollow "Wix Studio setup" in Documentation.html.\n`);
  zip(wix, join(dir, `${style.name}-Wix-Studio-Kit.zip`));

  // Docs, licence, listing, screenshots
  writeFileSync(join(dir, 'Documentation.html'), documentationHtml(style, cfg));
  writeFileSync(join(dir, 'LICENSE.txt'), licenseText(style, cfg));
  writeFileSync(join(dir, 'CHANGELOG.md'), changelog(style, cfg));
  writeFileSync(join(out, `${style.name}-LISTING.md`), listing(style, cfg));
  cpSync(join(ROOT, 'screenshots', slug), join(dir, 'screenshots'), { recursive: true });

  // What the buyer downloads
  zip(dir, join(out, `${style.name}-v${cfg.version}.zip`));
  console.log(`📦 ${style.name}`);
}

// Theme Store submission and all-templates bundle
zip(join(ROOT, 'dist/shopify/local'), join(out, `Local-ThemeStore-Submission-v${cfg.version}.zip`));
const bundle = join(out, '.tmp', 'bundle');
mkdirSync(bundle, { recursive: true });
for (const slug of listStyles()) { const n = loadStyle(slug).name; cpSync(join(out, `${n}-v${cfg.version}.zip`), join(bundle, `${n}-v${cfg.version}.zip`)); }
zip(bundle, join(out, `All-Templates-Bundle-v${cfg.version}.zip`));
rmSync(join(out, '.tmp'), { recursive: true, force: true });
await browser.close();
console.log(`✓ release packages in dist/release${draft ? ' (DRAFT: placeholder contact details)' : ''}`);
