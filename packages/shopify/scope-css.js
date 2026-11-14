// Scopes a template's personality CSS under `body.style-<slug>` so all twelve
// templates can ship inside one theme and be switched with a single setting.
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function scopeSelector(sel, scope) {
  sel = sel.trim();
  if (sel.startsWith(':root')) return `body${scope}${sel.slice(5)}`;
  if (/^body\b/.test(sel)) return `body${scope}${sel.slice(4)}`;
  return `body${scope} ${sel}`;
}

export function scopeCss(css, scope) {
  css = stripComments(css);
  let out = '';
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    // find the matching closing brace
    let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    const body = css.slice(open + 1, j - 1);
    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      out += `${prelude} {\n${scopeCss(body, scope)}}\n`;
    } else if (prelude.startsWith('@')) {
      out += `${prelude} {${body}}\n`;
    } else {
      const selectors = prelude.split(',').map((s) => scopeSelector(s, scope)).join(', ');
      out += `${selectors} {${body}}\n`;
    }
    i = j;
  }
  return out;
}
