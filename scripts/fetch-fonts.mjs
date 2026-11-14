// Downloads each template's Google Fonts (latin subset, woff2) into packages/core/fonts
// and writes styles/<template>/fonts.json. Run once when a template's fonts change;
// the files are committed so builds never depend on a third-party font CDN.
// All fonts are licensed under the SIL Open Font License, which allows bundling.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, listStyles, loadStyle, fontsUrl } from '../packages/core/style.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const dir = join(ROOT, 'packages/core/fonts');
mkdirSync(dir, { recursive: true });
const only = process.argv.slice(2);

for (const slug of only.length ? only : listStyles()) {
  const style = loadStyle(slug);
  const css = await (await fetch(fontsUrl(style), { headers: { 'User-Agent': UA } })).text();
  const faces = [];
  for (const m of css.matchAll(/\/\* latin \*\/\s*@font-face\s*{([^}]*)}/g)) {
    const body = m[1];
    const get = (p) => body.match(new RegExp(`${p}:\\s*([^;]+);`))?.[1].trim();
    const family = get('font-family').replace(/'/g, '');
    const url = body.match(/url\((https:[^)]+\.woff2)\)/)[1];
    const file = `${family.toLowerCase().replace(/\s+/g, '-')}-${createHash('sha1').update(url).digest('hex').slice(0, 8)}.woff2`;
    if (!existsSync(join(dir, file))) writeFileSync(join(dir, file), Buffer.from(await (await fetch(url)).arrayBuffer()));
    faces.push({ family, style: get('font-style'), weight: get('font-weight'), file, unicodeRange: get('unicode-range') });
  }
  writeFileSync(join(ROOT, 'styles', slug, 'fonts.json'), JSON.stringify(faces, null, 2) + '\n');
  console.log(`${slug}: ${faces.length} faces`);
}
