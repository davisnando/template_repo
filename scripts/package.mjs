// Zips each Shopify theme for "Online Store → Themes → Add theme → Upload zip file".
// Squarespace templates are deployed with git (see README), so they are not zipped.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, listStyles } from '../packages/core/style.js';

const out = join(ROOT, 'dist/packages');
mkdirSync(out, { recursive: true });
for (const slug of ['local', ...listStyles()]) {
  const zip = join(out, `shopify-${slug}.zip`);
  rmSync(zip, { force: true });
  execFileSync('zip', ['-qr', zip, '.'], { cwd: join(ROOT, 'dist/shopify', slug) });
  console.log(`📦 ${zip.replace(ROOT, '')}`);
}
