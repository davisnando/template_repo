// Accessibility audit (axe-core, WCAG 2.1 A/AA) of every template's preview, desktop and mobile.
//   node scripts/a11y.mjs [template…]
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, listStyles } from '../packages/core/style.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const only = process.argv.slice(2);
const browser = await chromium.launch();
let total = 0;

for (const slug of only.length ? only : listStyles()) {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(pathToFileURL(join(ROOT, 'dist/preview', slug, 'index.html')).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ content: axeSource });
    const { violations } = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
    for (const v of violations) {
      total++;
      console.log(`${slug} @${viewport.width} [${v.impact}] ${v.id}: ${v.help}`);
      for (const n of v.nodes.slice(0, 4)) console.log(`    ${n.target.join(' ')} — ${n.failureSummary.split('\n').slice(1).join(' ').slice(0, 160)}`);
    }
    await page.close();
  }
}
await browser.close();
console.log(total ? `${total} violations` : '✓ no accessibility violations');
process.exit(total ? 1 : 0);
