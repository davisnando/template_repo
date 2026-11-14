// Procedural SVG placeholder artwork, drawn per style from the style's palette.
// Merchants replace these with their own photos from the theme editor; until then
// every template still looks finished and nothing depends on licensed stock photos.

const rng = (seed) => {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};
const svg = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>\n`;

// ---------- Minimalist: ceramic vessels under an arch ----------
function vessel(x, base, s, fill, kind) {
  const shapes = [
    `M${x - 60 * s},${base} C${x - 95 * s},${base - 120 * s} ${x - 40 * s},${base - 170 * s} ${x - 28 * s},${base - 230 * s} L${x + 28 * s},${base - 230 * s} C${x + 40 * s},${base - 170 * s} ${x + 95 * s},${base - 120 * s} ${x + 60 * s},${base} Z`,
    `M${x - 85 * s},${base} C${x - 110 * s},${base - 60 * s} ${x - 90 * s},${base - 120 * s} ${x - 70 * s},${base - 130 * s} L${x + 70 * s},${base - 130 * s} C${x + 90 * s},${base - 120 * s} ${x + 110 * s},${base - 60 * s} ${x + 85 * s},${base} Z`,
    `M${x - 40 * s},${base} C${x - 70 * s},${base - 90 * s} ${x - 70 * s},${base - 200 * s} ${x - 14 * s},${base - 260 * s} L${x - 14 * s},${base - 320 * s} L${x + 14 * s},${base - 320 * s} L${x + 14 * s},${base - 260 * s} C${x + 70 * s},${base - 200 * s} ${x + 70 * s},${base - 90 * s} ${x + 40 * s},${base} Z`,
  ];
  return `<path d="${shapes[kind % 3]}" fill="${fill}"/>`;
}
function minimalist(w, h, p, seed) {
  const r = rng(seed);
  const base = h * 0.78;
  const aw = Math.min(w, h) * 0.62;
  const ax = w / 2 - aw / 2 + (r() - 0.5) * w * 0.12;
  const n = 2 + Math.floor(r() * 2);
  let vessels = '';
  for (let i = 0; i < n; i++) {
    const x = ax + aw * ((i + 0.5) / n) + (r() - 0.5) * 30;
    vessels += vessel(x, base, 0.9 + r() * 0.7 * (h / 900), [p.accent, p.text, p.alt][(i + seed) % 3], Math.floor(r() * 3));
  }
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.surface}"/>
<path d="M${ax},${base} L${ax},${h * 0.32} A${aw / 2},${aw / 2} 0 0 1 ${ax + aw},${h * 0.32} L${ax + aw},${base} Z" fill="${p.bg}"/>
<circle cx="${ax + aw * (0.2 + r() * 0.6)}" cy="${h * 0.3}" r="${aw * 0.11}" fill="${p.accent}" opacity=".18"/>
<rect x="0" y="${base}" width="${w}" height="${h - base}" fill="${p.border}" opacity=".55"/>
${vessels}
<line x1="0" y1="${base}" x2="${w}" y2="${base}" stroke="${p.text}" stroke-width="2" opacity=".25"/>`);
}

// ---------- Futuristic: neon grid horizon + glowing orb ----------
function futuristic(w, h, p, seed) {
  const r = rng(seed);
  const hz = h * (0.55 + r() * 0.1);
  let grid = '';
  for (let i = -20; i <= 20; i++) grid += `<line x1="${w / 2 + i * 22}" y1="${hz}" x2="${w / 2 + i * w * 0.12}" y2="${h}" />`;
  for (let j = 1; j < 12; j++) {
    const y = hz + (h - hz) * Math.pow(j / 12, 1.8);
    grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" />`;
  }
  const cx = w * (0.35 + r() * 0.3), cy = hz - h * 0.12, R = Math.min(w, h) * (0.2 + r() * 0.08);
  let rings = '';
  for (let k = 0; k < 4; k++) rings += `<ellipse cx="${cx}" cy="${cy}" rx="${R * (1.25 + k * 0.28)}" ry="${R * (0.32 + k * 0.08)}" fill="none" stroke="${k % 2 ? p.alt : p.accent}" stroke-width="${2 - k * 0.3}" opacity="${0.8 - k * 0.15}" transform="rotate(${-12 + r() * 6} ${cx} ${cy})"/>`;
  let stars = '';
  for (let i = 0; i < 70; i++) stars += `<circle cx="${r() * w}" cy="${r() * hz}" r="${r() * 1.6 + 0.3}" fill="#fff" opacity="${r() * 0.7 + 0.1}"/>`;
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="url(#sky)"/>
${stars}
<circle cx="${cx}" cy="${cy}" r="${R * 2.2}" fill="url(#glow)"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#orb)"/>
${rings}
<rect y="${hz}" width="${w}" height="${h - hz}" fill="${p.bg}"/>
<g stroke="${p.accent}" stroke-width="1.2" opacity=".55">${grid}</g>
<rect y="${hz - 2}" width="${w}" height="4" fill="${p.accent}" filter="url(#blur)"/>`,
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.surface}"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="${p.alt}" stop-opacity=".55"/><stop offset="1" stop-color="${p.alt}" stop-opacity="0"/></radialGradient>
<radialGradient id="orb" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="${p.accent}"/><stop offset="1" stop-color="${p.alt}"/></radialGradient>
<filter id="blur"><feGaussianBlur stdDeviation="6"/></filter>`);
}

// ---------- Luxury: stacked spa stones, gold arcs, dark marble ----------
function luxury(w, h, p, seed) {
  const r = rng(seed);
  const cx = w > h * 1.2 ? w * 0.7 : w * (0.4 + r() * 0.2);
  let y = h * 0.82, stones = '', sw = Math.min(w, h) * 0.42;
  for (let i = 0; i < 4 + Math.floor(r() * 2); i++) {
    const rx = sw * (1 - i * 0.16) / 2, ry = rx * (0.32 + r() * 0.08);
    stones += `<ellipse cx="${cx + (r() - 0.5) * 20}" cy="${y - ry}" rx="${rx}" ry="${ry}" fill="url(#stone)"/><ellipse cx="${cx - rx * 0.25}" cy="${y - ry * 1.45}" rx="${rx * 0.5}" ry="${ry * 0.18}" fill="#fff" opacity=".06"/>`;
    y -= ry * 1.85;
  }
  let veins = '';
  for (let i = 0; i < 7; i++) veins += `<path d="M${r() * w},0 C${r() * w},${h * 0.3} ${r() * w},${h * 0.6} ${r() * w},${h}" stroke="#fff" stroke-width="${r() * 1.2 + 0.3}" opacity=".05" fill="none"/>`;
  let arcs = '';
  for (let k = 0; k < 3; k++) arcs += `<circle cx="${cx}" cy="${h * 0.45}" r="${Math.min(w, h) * (0.34 + k * 0.07)}" fill="none" stroke="${p.accent}" stroke-width="${k === 0 ? 1.5 : 0.8}" opacity="${0.7 - k * 0.2}" stroke-dasharray="${k === 1 ? '2 8' : 'none'}"/>`;
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="url(#bg)"/>${veins}${arcs}
<ellipse cx="${cx}" cy="${h * 0.83}" rx="${sw * 0.7}" ry="${sw * 0.06}" fill="#000" opacity=".5"/>
${stones}
<line x1="${w * 0.08}" y1="${h * 0.9}" x2="${w * 0.92}" y2="${h * 0.9}" stroke="${p.accent}" stroke-width="1" opacity=".5"/>`,
  `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.surface}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient>
<radialGradient id="stone" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#5a544b"/><stop offset=".6" stop-color="#2a2722"/><stop offset="1" stop-color="#141210"/></radialGradient>`);
}

// ---------- Brutalist: flat blocks, halftone, hard shadows ----------
function brutalist(w, h, p, seed) {
  const r = rng(seed);
  const cols = [p.accent, p.alt, p.text, p.bg];
  let blocks = '';
  for (let i = 0; i < 5; i++) {
    const bw = w * (0.2 + r() * 0.35), bh = h * (0.15 + r() * 0.35);
    const x = r() * (w - bw), y = r() * (h - bh);
    blocks += `<rect x="${x + 16}" y="${y + 16}" width="${bw}" height="${bh}" fill="${p.text}"/><rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${cols[i % 4]}" stroke="${p.text}" stroke-width="6"/>`;
  }
  const cx = w * (0.3 + r() * 0.4), cy = h * (0.35 + r() * 0.3), R = Math.min(w, h) * 0.22;
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.surface}"/>
<rect width="${w}" height="${h}" fill="url(#dots)"/>
${blocks}
<circle cx="${cx + 18}" cy="${cy + 18}" r="${R}" fill="${p.text}"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="${p.accent}" stroke="${p.text}" stroke-width="6"/>
<circle cx="${cx}" cy="${cy}" r="${R * 0.55}" fill="url(#dots2)"/>
<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${p.text}" stroke-width="12"/>`,
  `<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="2.4" fill="${p.text}" opacity=".35"/></pattern>
<pattern id="dots2" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="3.5" fill="${p.text}"/></pattern>`);
}

// ---------- Professional: rising bars + trend line on navy ----------
function professional(w, h, p, seed) {
  const r = rng(seed);
  let grid = '';
  for (let x = 0; x < w; x += 60) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 0; y < h; y += 60) grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  const n = 7, gap = w * 0.025, bw = (w * 0.7 - gap * (n - 1)) / n, x0 = w * 0.15, base = h * 0.82;
  let bars = '', pts = [];
  for (let i = 0; i < n; i++) {
    const bh = h * (0.18 + (i / n) * 0.45 + r() * 0.08);
    const x = x0 + i * (bw + gap);
    bars += `<rect x="${x}" y="${base - bh}" width="${bw}" height="${bh}" rx="6" fill="url(#bar)" opacity="${0.55 + i * 0.06}"/>`;
    pts.push(`${x + bw / 2},${base - bh - h * 0.06}`);
  }
  const last = pts[pts.length - 1].split(',');
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<g stroke="#fff" stroke-opacity=".06">${grid}</g>
${bars}
<polyline points="${pts.join(' ')}" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
${pts.map((pt) => `<circle cx="${pt.split(',')[0]}" cy="${pt.split(',')[1]}" r="7" fill="${p.bg}" stroke="#fff" stroke-width="3"/>`).join('')}
<g transform="translate(${w * 0.18},${h * 0.12})"><rect width="240" height="96" rx="14" fill="#fff"/><rect x="22" y="24" width="90" height="12" rx="6" fill="${p.muted}" opacity=".5"/><rect x="22" y="50" width="140" height="22" rx="6" fill="${p.accent}"/></g>
<line x1="${x0}" y1="${base}" x2="${w * 0.88}" y2="${base}" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`,
  `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.text}"/><stop offset="1" stop-color="#0a1b2e"/></linearGradient>
<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.accent}"/><stop offset="1" stop-color="${p.accent}" stop-opacity=".25"/></linearGradient>`);
}

// ---------- Elegant: botanical stems and blooms in an arch ----------
function bloom(x, y, s, fill, centre) {
  let petals = '';
  for (let i = 0; i < 8; i++) petals += `<ellipse cx="${x}" cy="${y - 26 * s}" rx="${13 * s}" ry="${28 * s}" fill="${fill}" transform="rotate(${i * 45} ${x} ${y})" opacity=".92"/>`;
  return petals + `<circle cx="${x}" cy="${y}" r="${10 * s}" fill="${centre}"/>`;
}
function elegant(w, h, p, seed) {
  const r = rng(seed);
  let stems = '', heads = '';
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const bx = w * 0.5 + (r() - 0.5) * w * 0.08, by = h * 0.92;
    const tx = w * (0.22 + r() * 0.56), ty = h * (0.18 + r() * 0.35);
    const mx = (bx + tx) / 2 + (r() - 0.5) * 120, my = (by + ty) / 2;
    stems += `<path d="M${bx},${by} Q${mx},${my} ${tx},${ty}" stroke="${p.alt}" stroke-width="3" fill="none"/>`;
    for (let k = 0; k < 2; k++) {
      const lx = (bx + mx) / 2 + (mx - bx) * k * 0.5, ly = (by + my) / 2 - k * 60;
      stems += `<ellipse cx="${lx + 22}" cy="${ly}" rx="26" ry="9" fill="${p.alt}" opacity=".8" transform="rotate(${-30 - r() * 30} ${lx} ${ly})"/>`;
    }
    const s = 1.1 + r() * 1.1 * (Math.min(w, h) / 900);
    heads += r() > 0.3 ? bloom(tx, ty, s, i % 2 ? p.accent : p.border, p.text) : `<circle cx="${tx}" cy="${ty}" r="${18 * s}" fill="${p.accent}" opacity=".7"/>`;
  }
  const aw = Math.min(w * 0.7, h * 0.62);
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.bg}"/>
<path d="M${w / 2 - aw / 2},${h} L${w / 2 - aw / 2},${h * 0.1 + aw / 2} A${aw / 2},${aw / 2} 0 0 1 ${w / 2 + aw / 2},${h * 0.1 + aw / 2} L${w / 2 + aw / 2},${h} Z" fill="${p.surface}"/>
<path d="M${w / 2 - aw / 2 - 18},${h} L${w / 2 - aw / 2 - 18},${h * 0.1 + aw / 2} A${aw / 2 + 18},${aw / 2 + 18} 0 0 1 ${w / 2 + aw / 2 + 18},${h * 0.1 + aw / 2} L${w / 2 + aw / 2 + 18},${h}" fill="none" stroke="${p.accent}" stroke-width="1.2" opacity=".6"/>
${stems}${heads}
<path d="M${w * 0.42},${h * 0.92} L${w * 0.58},${h * 0.92} L${w * 0.555},${h} L${w * 0.445},${h} Z" fill="${p.text}" opacity=".85"/>`);
}

// ---------- Friendly: happy dog + blobs + paw prints ----------
function paw(x, y, s, fill, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="${fill}"><ellipse cx="0" cy="10" rx="16" ry="13"/><circle cx="-16" cy="-8" r="6.5"/><circle cx="-6" cy="-16" r="6.5"/><circle cx="6" cy="-16" r="6.5"/><circle cx="16" cy="-8" r="6.5"/></g>`;
}
function friendly(w, h, p, seed) {
  const r = rng(seed);
  const cx = w * (0.45 + r() * 0.1), cy = h * 0.55, R = Math.min(w, h) * 0.26;
  const fur = [p.yellow || '#F6C14B', '#C98B5A', '#E8D3B5'][seed % 3];
  let paws = '';
  for (let i = 0; i < 6; i++) paws += paw(r() * w, r() * h, 0.8 + r() * 1.2, i % 2 ? p.alt : p.accent, r() * 60 - 30);
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.surface}"/>
<path d="M${w * 0.1},${h * 0.3} C${w * 0.2},${h * 0.02} ${w * 0.7},${h * 0.0} ${w * 0.85},${h * 0.25} C${w * 1.0},${h * 0.5} ${w * 0.95},${h * 0.95} ${w * 0.6},${h * 0.95} C${w * 0.3},${h * 0.97} ${w * 0.0},${h * 0.65} ${w * 0.1},${h * 0.3} Z" fill="${p.accent}" opacity=".9"/>
<circle cx="${w * 0.88}" cy="${h * 0.15}" r="${R * 0.35}" fill="${p.alt}"/>
<circle cx="${w * 0.12}" cy="${h * 0.82}" r="${R * 0.25}" fill="${p.yellow || '#FFC93C'}"/>
<g opacity=".35">${paws}</g>
<g>
 <ellipse cx="${cx - R * 0.85}" cy="${cy - R * 0.35}" rx="${R * 0.32}" ry="${R * 0.62}" fill="#8A5A3B" transform="rotate(25 ${cx - R * 0.85} ${cy - R * 0.35})"/>
 <ellipse cx="${cx + R * 0.85}" cy="${cy - R * 0.35}" rx="${R * 0.32}" ry="${R * 0.62}" fill="#8A5A3B" transform="rotate(-25 ${cx + R * 0.85} ${cy - R * 0.35})"/>
 <circle cx="${cx}" cy="${cy}" r="${R}" fill="${fur}"/>
 <ellipse cx="${cx}" cy="${cy + R * 0.38}" rx="${R * 0.55}" ry="${R * 0.42}" fill="#FFF4E2"/>
 <circle cx="${cx - R * 0.36}" cy="${cy - R * 0.12}" r="${R * 0.11}" fill="#2B2118"/><circle cx="${cx - R * 0.33}" cy="${cy - R * 0.16}" r="${R * 0.035}" fill="#fff"/>
 <circle cx="${cx + R * 0.36}" cy="${cy - R * 0.12}" r="${R * 0.11}" fill="#2B2118"/><circle cx="${cx + R * 0.39}" cy="${cy - R * 0.16}" r="${R * 0.035}" fill="#fff"/>
 <ellipse cx="${cx}" cy="${cy + R * 0.2}" rx="${R * 0.16}" ry="${R * 0.11}" fill="#2B2118"/>
 <path d="M${cx - R * 0.2},${cy + R * 0.42} Q${cx},${cy + R * 0.6} ${cx + R * 0.2},${cy + R * 0.42}" stroke="#2B2118" stroke-width="${R * 0.04}" fill="none" stroke-linecap="round"/>
 <ellipse cx="${cx}" cy="${cy + R * 0.6}" rx="${R * 0.1}" ry="${R * 0.13}" fill="#FF6F91"/>
 <circle cx="${cx - R * 0.6}" cy="${cy + R * 0.25}" r="${R * 0.1}" fill="#FF8FA3" opacity=".6"/><circle cx="${cx + R * 0.6}" cy="${cy + R * 0.25}" r="${R * 0.1}" fill="#FF8FA3" opacity=".6"/>
 <path d="M${cx - R * 0.7},${cy + R * 0.85} Q${cx},${cy + R * 1.1} ${cx + R * 0.7},${cy + R * 0.85} L${cx + R * 0.6},${cy + R * 1.05} Q${cx},${cy + R * 1.25} ${cx - R * 0.6},${cy + R * 1.05} Z" fill="${p.alt}"/>
 <circle cx="${cx}" cy="${cy + R * 1.18}" r="${R * 0.1}" fill="${p.yellow || '#FFC93C'}"/>
</g>`);
}

// ---------- Shared: stylised neighbourhood map ----------
function map(w, h, p, seed, dark) {
  const r = rng(seed + 7);
  const land = dark ? p.surface : p.surface, road = dark ? p.border : p.bg;
  let blocks = '';
  for (let x = 0; x < w; x += 140) for (let y = 0; y < h; y += 120)
    blocks += `<rect x="${x + 10}" y="${y + 10}" width="${120}" height="${100}" rx="8" fill="${r() > 0.85 ? p.alt : land}" opacity="${r() > 0.85 ? 0.35 : 1}"/>`;
  const px = w * 0.55, py = h * 0.45;
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${road}"/>
${blocks}
<path d="M0,${h * 0.7} C${w * 0.3},${h * 0.6} ${w * 0.6},${h * 0.85} ${w},${h * 0.65}" stroke="${p.accent}" stroke-opacity=".25" stroke-width="34" fill="none"/>
<path d="M${w * 0.2},0 L${w * 0.35},${h}" stroke="${road}" stroke-width="22"/>
<circle cx="${px}" cy="${py}" r="70" fill="${p.accent}" opacity=".18"/>
<path d="M${px},${py + 40} C${px - 10},${py + 10} ${px - 34},${py - 8} ${px - 34},${py - 34} A34,34 0 1 1 ${px + 34},${py - 34} C${px + 34},${py - 8} ${px + 10},${py + 10} ${px},${py + 40} Z" fill="${p.accent}" stroke="${dark ? p.bg : '#fff'}" stroke-width="4"/>
<circle cx="${px}" cy="${py - 34}" r="12" fill="${dark ? p.bg : '#fff'}"/>`);
}


// ---------- Organic (Terroir): sun over rolling hills, wheat, film grain ----------
const grain = (op = 0.18) => `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${op} 0"/></filter>`;
function organic(w, h, p, seed) {
  const r = rng(seed);
  const hill = (y, amp, fill, k) => {
    let d = `M0,${h} L0,${y}`;
    for (let x = 0; x <= w; x += w / 4) d += ` Q${x + w / 8},${y - amp * (0.5 + r()) * (k % 2 ? 1 : -0.6)} ${x + w / 4},${y + (r() - 0.5) * amp * 0.4}`;
    return `<path d="${d} L${w},${h} Z" fill="${fill}"/>`;
  };
  let wheat = '';
  for (let i = 0; i < 26; i++) {
    const x = r() * w, bh = h * (0.12 + r() * 0.12), y = h;
    wheat += `<path d="M${x},${y} Q${x + 8},${y - bh / 2} ${x + 14 * (r() - 0.3)},${y - bh}" stroke="${p.text}" stroke-width="2" fill="none" opacity=".55"/>`;
    for (let k = 0; k < 5; k++) wheat += `<ellipse cx="${x + 10 * (r() - 0.3)}" cy="${y - bh + k * 9}" rx="3.2" ry="8" fill="${p.accent}" opacity=".8" transform="rotate(${k % 2 ? 25 : -25} ${x} ${y - bh + k * 9})"/>`;
  }
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="url(#sky)"/>
<circle cx="${w > h * 1.2 ? w * 0.74 : w * (0.3 + r() * 0.4)}" cy="${h * 0.38}" r="${Math.min(w, h) * 0.17}" fill="${p.accent}" opacity=".85"/>
${hill(h * 0.55, h * 0.12, p.border, 1)}${hill(h * 0.66, h * 0.1, p.alt, 2)}${hill(h * 0.78, h * 0.08, '#3F5236', 3)}
${wheat}
<rect width="${w}" height="${h}" filter="url(#grain)"/>`,
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.surface}"/><stop offset="1" stop-color="#F3C9A0"/></linearGradient>${grain()}`);
}

// ---------- Athletic (Pulse): diagonal speed stripes + kettlebell ----------
function athletic(w, h, p, seed) {
  const r = rng(seed);
  let stripes = '';
  for (let i = -4; i < 14; i++) {
    const x = i * w * 0.11 + r() * 20;
    stripes += `<polygon points="${x},${h} ${x + w * 0.05},${h} ${x + w * 0.05 + h * 0.6},0 ${x + h * 0.6},0" fill="${i % 3 ? '#fff' : p.accent}" opacity="${i % 3 ? 0.04 : 0.9}"/>`;
  }
  const cx = w * (0.45 + r() * 0.15), cy = h * 0.58, R = Math.min(w, h) * 0.24;
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.bg}"/>
${stripes}
<ellipse cx="${cx}" cy="${cy + R * 1.05}" rx="${R * 1.1}" ry="${R * 0.12}" fill="#000" opacity=".6"/>
<path d="M${cx - R * 0.55},${cy - R * 0.7} C${cx - R * 0.6},${cy - R * 1.6} ${cx + R * 0.6},${cy - R * 1.6} ${cx + R * 0.55},${cy - R * 0.7}" stroke="#2E2E31" stroke-width="${R * 0.26}" fill="none" stroke-linecap="round"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#bell)"/>
<rect x="${cx - R * 0.42}" y="${cy - R * 0.12}" width="${R * 0.84}" height="${R * 0.38}" rx="${R * 0.06}" fill="${p.accent}"/>
<text x="${cx}" y="${cy + R * 0.16}" font-family="Anton, Impact, sans-serif" font-size="${R * 0.3}" text-anchor="middle" fill="${p.bg}">24 KG</text>
<rect x="0" y="${h - 10}" width="${w}" height="10" fill="${p.alt}"/>`,
  `<radialGradient id="bell" cx=".35" cy=".3"><stop offset="0" stop-color="#5a5a60"/><stop offset=".55" stop-color="#252528"/><stop offset="1" stop-color="#0c0c0d"/></radialGradient>`);
}

// ---------- Pastel (Tessera): soft shapes, scissors & sparkles ----------
function sparkle(x, y, s, fill) {
  return `<path d="M${x},${y - 20 * s} C${x + 3 * s},${y - 3 * s} ${x + 3 * s},${y - 3 * s} ${x + 20 * s},${y} C${x + 3 * s},${y + 3 * s} ${x + 3 * s},${y + 3 * s} ${x},${y + 20 * s} C${x - 3 * s},${y + 3 * s} ${x - 3 * s},${y + 3 * s} ${x - 20 * s},${y} C${x - 3 * s},${y - 3 * s} ${x - 3 * s},${y - 3 * s} ${x},${y - 20 * s} Z" fill="${fill}"/>`;
}
function pastel(w, h, p, seed) {
  const r = rng(seed);
  const cx = w * (0.4 + r() * 0.2), cy = h * 0.5, S = Math.min(w, h) / 900;
  let dots = '';
  for (let i = 0; i < 6; i++) dots += sparkle(r() * w, r() * h, 0.8 + r() * 1.4, i % 2 ? p.accent : '#fff');
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<circle cx="${w * 0.78}" cy="${h * 0.25}" r="${260 * S}" fill="${p.alt}" opacity=".75"/>
<rect x="${w * 0.08}" y="${h * 0.55}" width="${360 * S}" height="${360 * S}" rx="${120 * S}" fill="#fff" opacity=".7" transform="rotate(-12 ${w * 0.2} ${h * 0.7})"/>
<g transform="translate(${cx} ${cy}) rotate(${-20 + r() * 12}) scale(${S * 1.25})">
  <polygon points="-18,-10 18,-10 6,-330 -2,-330" fill="#D9D3E6" transform="rotate(14)"/>
  <polygon points="-18,-10 18,-10 2,-330 -6,-330" fill="#EDE9F5" transform="rotate(-14)"/>
  <circle r="14" fill="${p.text}"/>
  <circle cx="-62" cy="120" r="58" fill="none" stroke="${p.accent}" stroke-width="22" />
  <circle cx="62" cy="120" r="58" fill="none" stroke="${p.accent}" stroke-width="22" />
  <path d="M-30,62 L-6,6 M30,62 L6,6" stroke="${p.accent}" stroke-width="22" stroke-linecap="round"/>
</g>
${dots}`,
  `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EFE7FF"/><stop offset="1" stop-color="#FFE9DF"/></linearGradient>`);
}

// ---------- Retro (Sundown): 70s sunburst, rainbow stripes, vinyl ----------
function retro(w, h, p, seed) {
  const r = rng(seed);
  const ox = w / 2, oy = h * 1.05;
  let rays = '';
  for (let i = 0; i < 24; i++) {
    const a1 = Math.PI + (i / 24) * Math.PI, a2 = Math.PI + ((i + 0.5) / 24) * Math.PI, L = Math.max(w, h) * 1.4;
    rays += `<polygon points="${ox},${oy} ${ox + Math.cos(a1) * L},${oy + Math.sin(a1) * L} ${ox + Math.cos(a2) * L},${oy + Math.sin(a2) * L}" fill="${p.surface}"/>`;
  }
  const cols = [p.accent, p.alt, '#B8452A', p.text];
  let arcs = '';
  const base = Math.min(w, h) * 0.62;
  cols.forEach((c, i) => { const rr = base - i * base * 0.11; arcs += `<path d="M${ox - rr},${oy} A${rr},${rr} 0 0 1 ${ox + rr},${oy}" fill="${c}"/>`; });
  const vx = w * (0.62 + r() * 0.1), vy = h * 0.42, V = Math.min(w, h) * 0.22;
  let grooves = '';
  for (let g = 0.42; g < 0.98; g += 0.07) grooves += `<circle cx="${vx}" cy="${vy}" r="${V * g}" fill="none" stroke="#3a3a3a" stroke-width="1.5"/>`;
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.bg}"/>
${rays}${arcs}
<circle cx="${ox}" cy="${oy}" r="${base * 0.56}" fill="${p.bg}"/>
<g transform="rotate(${r() * 30} ${vx} ${vy})"><circle cx="${vx + 10}" cy="${vy + 14}" r="${V}" fill="#000" opacity=".25"/><circle cx="${vx}" cy="${vy}" r="${V}" fill="#141414"/>${grooves}
<path d="M${vx - V * 0.9},${vy - V * 0.2} A${V * 0.92},${V * 0.92} 0 0 1 ${vx - V * 0.2},${vy - V * 0.9}" stroke="#fff" stroke-opacity=".18" stroke-width="6" fill="none"/>
<circle cx="${vx}" cy="${vy}" r="${V * 0.33}" fill="${p.alt}"/><circle cx="${vx}" cy="${vy}" r="${V * 0.04}" fill="${p.bg}"/></g>
<rect width="${w}" height="${h}" filter="url(#grain)"/>`, grain(0.22));
}

// ---------- Swiss (Folio): grid, red circle, black planes ----------
function swiss(w, h, p, seed) {
  const r = rng(seed);
  let grid = '';
  for (let x = 0; x <= w; x += w / 12) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 0; y <= h; y += h / 8) grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  const R = Math.min(w, h) * (0.24 + r() * 0.08);
  const cx = w * (0.55 + r() * 0.2), cy = h * (0.35 + r() * 0.2);
  const bx = w * (0.08 + r() * 0.2), bw = w * (0.3 + r() * 0.15);
  return svg(w, h, `
<rect width="${w}" height="${h}" fill="${p.surface}"/>
<g stroke="${p.text}" stroke-opacity=".08">${grid}</g>
<rect x="${bx}" y="${h * 0.5}" width="${bw}" height="${h * 0.5}" fill="${p.text}"/>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="${p.accent}" style="mix-blend-mode:multiply"/>
<rect x="${w * 0.66}" y="${h * 0.72}" width="${w * 0.22}" height="${h * 0.02}" fill="${p.text}"/>
<line x1="0" y1="${h * 0.5}" x2="${w}" y2="${h * 0.5}" stroke="${p.text}" stroke-width="2"/>
<text x="${w * 0.04}" y="${h * 0.12}" font-family="Archivo, Helvetica, sans-serif" font-weight="800" font-size="${h * 0.07}" fill="${p.text}">${String(seed).padStart(2, '0')}</text>`);
}

const motifs = { minimalist, futuristic, luxury, brutalist, professional, elegant, friendly, organic, athletic, pastel, retro, swiss };

/** Intrinsic sizes of the bundled artwork (used for width/height attributes). */
export const ART_SIZES = { 'hero.svg': [1600, 1100], 'about.svg': [1000, 1250], 'map.svg': [1200, 900] };
for (let i = 1; i <= 4; i++) ART_SIZES[`gallery-${i}.svg`] = [1000, 1000];

/** Returns { filename: svgString } for one style. */
export function artworkFor(motif, palette, dark = false) {
  const draw = motifs[motif];
  const files = {
    'hero.svg': draw(1600, 1100, palette, 1),
    'about.svg': draw(1000, 1250, palette, 2),
    'map.svg': map(1200, 900, palette, 3, dark),
  };
  for (let i = 1; i <= 4; i++) files[`gallery-${i}.svg`] = draw(1000, 1000, palette, 10 + i);
  return files;
}
