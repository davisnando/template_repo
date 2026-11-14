// Runs Shopify's official Theme Check on every built Shopify theme.
//   node scripts/theme-check.mjs [theme…]
import { join } from 'node:path';
import { readdirSync } from 'node:fs';
import { themeCheckRun } from '@shopify/theme-check-node';
import { ROOT } from '../packages/core/style.js';

const base = join(ROOT, 'dist/shopify');
const themes = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(base);
let errors = 0;
for (const t of themes) {
  const { offenses } = await themeCheckRun(join(base, t), undefined, () => {});
  const sev = ['error', 'warning', 'info'];
  for (const o of offenses) {
    if (o.severity === 0) errors++;
    console.log(`${t} [${sev[o.severity]}] ${o.check} ${o.uri.split('/dist/shopify/')[1] ?? o.uri}:${o.start?.line ?? ''} ${o.message}`);
  }
  console.log(`${t}: ${offenses.length} offenses`);
}
process.exit(errors ? 1 : 0);
