// Builds every style for every target into dist/<target>/<style>/.
//   node scripts/build.mjs            all styles
//   node scripts/build.mjs luxury     one style
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT, listStyles, loadStyle } from '../packages/core/style.js';
import { artworkFor } from '../packages/core/art.js';
import { buildPreview } from '../packages/preview/build.js';
import { buildShopify } from '../packages/shopify/build.js';
import { buildSquarespace } from '../packages/squarespace/build.js';

const targets = { preview: buildPreview, shopify: buildShopify, squarespace: buildSquarespace };
const only = process.argv.slice(2);
const styles = only.length ? only : listStyles();

for (const slug of styles) {
  const style = loadStyle(slug);
  const art = artworkFor(style.motif, style.colors, style.dark);
  for (const [target, build] of Object.entries(targets)) {
    const out = join(ROOT, 'dist', target, slug);
    rmSync(out, { recursive: true, force: true });
    const files = build(style, art);
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(out, path)), { recursive: true });
      writeFileSync(join(out, path), content);
    }
  }
  console.log(`✓ ${slug}`);
}
