// Renders screenshots/<style>/{desktop,full,mobile}.png from the preview build.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, listStyles } from '../packages/core/style.js';

const { chromium } = createRequire(import.meta.url)('playwright');

const only = process.argv.slice(2);
const styles = only.length ? only : listStyles();
const browser = await chromium.launch();

for (const slug of styles) {
  const url = pathToFileURL(join(ROOT, 'dist/preview', slug, 'index.html')).href;
  const dir = join(ROOT, 'screenshots', slug);
  mkdirSync(dir, { recursive: true });
  const shots = [
    { name: 'desktop', viewport: { width: 1440, height: 900 }, scale: 2, fullPage: false },
    { name: 'full', viewport: { width: 1440, height: 900 }, scale: 1, fullPage: true },
    { name: 'mobile', viewport: { width: 390, height: 844 }, scale: 2, fullPage: false },
  ];
  for (const s of shots) {
    const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: s.scale });
    await page.goto(url, { waitUntil: 'networkidle' });
    // Scroll through once so lazy-loaded images are fetched before capturing.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
      await Promise.race([
        Promise.all([...document.images].map((img) => img.decode().catch(() => {}))),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
      await document.fonts.ready;
    });
    await page.screenshot({ path: join(dir, `${s.name}.png`), fullPage: s.fullPage });
    await page.close();
  }
  console.log(`📸 ${slug}`);
}
await browser.close();
