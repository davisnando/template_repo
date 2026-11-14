// Buyer-facing files for a template's release package: documentation, licence,
// changelog and marketplace listing copy.
import { esc } from '../core/context.js';
import { sqsPalette, fontPlan } from '../squarespace71/build.js';

const INDUSTRY = {
  atelier: 'studios, makers & workshops', aurum: 'spas, salons & premium services', camellia: 'florists, bakeries & boutiques',
  folio: 'architects, designers & agencies', marigold: 'pet care, childcare & family businesses', meridian: 'accountants, lawyers & consultants',
  monolith: 'cafés, bars & streetwear shops', nebula: 'repair shops, tech services & mobility', pulse: 'gyms, studios & sports clubs',
  sundown: 'record shops, diners & vintage stores', terroir: 'restaurants, bakeries & farm shops', tessera: 'hair salons, beauty & wellness studios',
};

const SQS_BLOCKS = {
  hero: 'First section. Add a Heading 1, a "Paragraph 3" label above it, a Paragraph 1 subheading and two Button blocks. Put the hero image in an Image block beside the text, or use it as the section background for full-bleed layouts.',
  services: 'A List section (Cards or Simple list layout): one item per service with title, description and the price as the item button or sub-title.',
  about: 'Two columns: an Image block (images/about.jpg) and text with a Paragraph 3 label, Heading 2, paragraph and a short list.',
  gallery: 'A Gallery section, Grid: Simple, 4 images (images/gallery-1…4.jpg).',
  testimonials: 'A List section (Simple layout) or Quote blocks, one per review. Use the alternate section colour theme.',
  visit: 'Two columns: hours and address as text, plus a Map block (or images/map.jpg).',
  contact: 'A Form block with Name, Email and Message fields. Set the storage to your email address.',
};

function contentRows(style) {
  const rows = [];
  for (const [id, sec] of Object.entries(style.sections)) {
    if (id === 'header' || id === 'footer') continue;
    const s = sec.settings || {};
    const lines = [s.eyebrow && `Label: ${s.eyebrow}`, s.heading && `Heading: ${s.heading}`, (s.subheading || s.intro || s.text) && `Text: ${s.subheading || s.intro || s.text}`,
      s.cta_label && `Buttons: ${[s.cta_label, s.cta2_label].filter(Boolean).join(' · ')}`, s.address && `Address: ${s.address.replace(/\n/g, ', ')}`,
      s.phone && `Phone: ${s.phone}`, s.email && `Email: ${s.email}`].filter(Boolean);
    const items = (sec.blocks || []).map((b) => Object.values(b).filter((v) => typeof v === 'string' && !v.endsWith('.svg') && v).join(' — ')).filter(Boolean);
    rows.push(`<tr><th scope="row">${id[0].toUpperCase() + id.slice(1)}</th><td>${esc(SQS_BLOCKS[id] || '')}</td><td>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}${items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}</td></tr>`);
  }
  return rows.join('\n');
}

export function documentationHtml(style, cfg) {
  const palette = sqsPalette(style);
  const fonts = fontPlan(style);
  const swatch = (hex) => `<span class="sw" style="background:${hex}"></span><code>${hex}</code>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(style.name)} — Documentation</title>
<style>
  :root { --ink: #1d1d1f; --muted: #5f6368; --line: #e3e3e6; --accent: ${style.colors.accent}; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.65 system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--ink); background: #fff; }
  main { max-width: 900px; margin: 0 auto; padding: 48px 20px 96px; }
  h1 { font-size: 2.6rem; margin: 0 0 .2rem; letter-spacing: -.02em; } h2 { margin-top: 3.2rem; padding-top: 1.2rem; border-top: 1px solid var(--line); } h3 { margin-top: 2rem; }
  .lead { color: var(--muted); font-size: 1.15rem; margin-top: 0; }
  img.shot { width: 100%; border: 1px solid var(--line); border-radius: 12px; margin: 1.5rem 0; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: .95rem; } th, td { text-align: left; vertical-align: top; padding: .6rem .5rem; border-bottom: 1px solid var(--line); } td p { margin: 0 0 .3rem; } td ul { margin: .3rem 0 0; padding-left: 1.1rem; }
  code { background: #f4f4f6; padding: .1em .35em; border-radius: 4px; font-size: .9em; }
  .sw { display: inline-block; width: 18px; height: 18px; border-radius: 4px; border: 1px solid var(--line); vertical-align: middle; margin-right: 6px; }
  ol li, ul li { margin: .3rem 0; } nav ol { columns: 2; }
  .note { background: #f7f7f9; border-left: 4px solid var(--accent); padding: .8rem 1rem; border-radius: 6px; }
  a { color: inherit; }
</style>
</head>
<body>
<main>
  <h1>${esc(style.name)}</h1>
  <p class="lead">${esc(style.style)} website template for ${esc(INDUSTRY[style.slug] || 'local businesses')} · Shopify &amp; Squarespace · v${esc(cfg.version)}</p>
  <img class="shot" src="screenshots/desktop.png" alt="${esc(style.name)} homepage" width="2880" height="1800">

  <nav aria-label="Contents"><ol>
    <li><a href="#contents">Package contents</a></li><li><a href="#shopify">Install on Shopify</a></li>
    <li><a href="#sqs71">Squarespace 7.1 setup</a></li><li><a href="#sqs70">Squarespace 7.0 (Developer Mode)</a></li>
    <li><a href="#customise">Customising</a></li><li><a href="#support">Support &amp; licence</a></li>
  </ol></nav>

  <h2 id="contents">Package contents</h2>
  <table>
    <tr><th scope="row"><code>${esc(style.name)}-Shopify-Theme.zip</code></th><td>Shopify Online Store 2.0 theme. Upload as-is.</td></tr>
    <tr><th scope="row"><code>${esc(style.name)}-Squarespace-7.1-Kit.zip</code></th><td>Custom CSS, fonts and images for Squarespace 7.1, plus this guide's setup steps.</td></tr>
    <tr><th scope="row"><code>${esc(style.name)}-Squarespace-7.0-Template.zip</code></th><td>Developer Platform template for Squarespace 7.0 sites with Developer Mode.</td></tr>
    <tr><th scope="row"><code>screenshots/</code></th><td>Desktop, full-page and mobile previews.</td></tr>
    <tr><th scope="row"><code>LICENSE.txt</code>, <code>CHANGELOG.md</code></th><td>Licence terms and version history.</td></tr>
  </table>

  <h2 id="shopify">Install on Shopify</h2>
  <ol>
    <li>In Shopify admin open <strong>Online Store → Themes</strong>, choose <strong>Add theme → Upload zip file</strong> and select <code>${esc(style.name)}-Shopify-Theme.zip</code>.</li>
    <li>Click <strong>Customize</strong>. The homepage already contains the demo layout. Edit every text, button and image in place.</li>
    <li>Create the menus <code>main-menu</code> (header) and <code>footer</code> under <strong>Online Store → Navigation</strong>.</li>
    <li>Create a page called “Contact” and set its template to <code>page.contact</code> to get a contact form.</li>
    <li>Upload your logo in the <strong>Header</strong> section and a favicon under <strong>Theme settings → Style</strong>.</li>
    <li>Sell products? Turn on the hidden <strong>Featured collection</strong> section on the homepage and pick a collection.</li>
    <li>Click <strong>Publish</strong>.</li>
  </ol>
  <p class="note">Theme settings → <strong>Style</strong> switches between all designs in the collection. Colours live in three <strong>colour schemes</strong>, and every section can use any of them.</p>
  <h3>Included features</h3>
  <p>Booking/contact form, opening hours, map, reviews, gallery, services with prices, newsletter signup. For stores, it also has the product page with variants, subscriptions, gift card recipients, pickup availability and dynamic checkout buttons, plus filtering, sorting, predictive search, cart notes, customer accounts, multi-currency and multi-language selectors, and app blocks.</p>

  <h2 id="sqs71">Squarespace 7.1 setup</h2>
  <p>Squarespace 7.1 doesn't allow uploading theme code, so the design is applied with Site Styles and Custom CSS. Allow about 30–45 minutes.</p>
  <h3>1. Colours</h3>
  <p>Open <strong>Site Styles → Colors → Palette</strong> and enter:</p>
  <table>${palette.map(([n, hex]) => `<tr><th scope="row">${n}</th><td>${swatch(hex)}</td></tr>`).join('')}</table>
  <h3>2. Fonts</h3>
  <p>Open <strong>Custom CSS</strong> (Website → Website Tools → Custom CSS), click <strong>Manage custom files</strong> and upload every file in the kit's <code>fonts/</code> folder. Then in <code>custom.css</code>, replace each placeholder with the URL of the uploaded file:</p>
  <table><tr><th scope="col">Placeholder</th><th scope="col">Font</th><th scope="col">Files</th></tr>
  ${fonts.map((f) => `<tr><td><code>${f.placeholder}</code></td><td>${esc(f.family)}</td><td>${f.files.map((x) => `<code>${x.file}</code> (${x.weight} ${x.style})`).join('<br>')}</td></tr>`).join('')}</table>
  <p class="note">If one family has several files, each file needs its own URL. Search <code>custom.css</code> for the file's weight and style and replace the placeholder on that line.</p>
  <h3>3. Custom CSS</h3>
  <p>Paste the whole of <code>custom.css</code> into Custom CSS and save. Buttons, headings, labels, images and forms pick up the ${esc(style.name)} styling.</p>
  <h3>4. Build the homepage</h3>
  <p>Add sections in this order. The images are in the kit's <code>images/</code> folder. Format small labels as <strong>Paragraph 3</strong>; the CSS turns them into ${esc(style.name)}'s label style.</p>
  <table><tr><th scope="col">Section</th><th scope="col">How to build it</th><th scope="col">Demo content</th></tr>
  ${contentRows(style)}</table>
  <h3>Selling Squarespace templates</h3>
  <p>Once the site is built, you can sell it to clients as a finished site by duplicating or transferring it, using Squarespace's site transfer options.</p>

  <h2 id="sqs70">Squarespace 7.0 (Developer Mode)</h2>
  <ol>
    <li>On a 7.0 site, enable <strong>Settings → Advanced → Developer Mode</strong>.</li>
    <li>Clone the site's template repository: <code>git clone https://YOUR-SITE.squarespace.com/template.git</code></li>
    <li>Replace its contents with the files from <code>${esc(style.name)}-Squarespace-7.0-Template.zip</code>, then commit and push.</li>
    <li>Set the generated <strong>home</strong> page as the homepage and add your pages to <strong>Main Navigation</strong>. Colours are tweaks in the Style Editor.</li>
  </ol>

  <h2 id="customise">Customising</h2>
  <ul>
    <li><strong>Colours:</strong> Shopify colour schemes and the Squarespace palette/tweaks.</li>
    <li><strong>Fonts:</strong> they're bundled and self-hosted, so no Google Fonts requests.</li>
    <li><strong>Images:</strong> replace the placeholder artwork with your own photos. Recommended sizes are 1600 × 1100 (hero), 1000 × 1250 (about) and 1000 × 1000 (gallery).</li>
    <li><strong>Accessibility:</strong> the default palette meets WCAG 2.1 AA contrast. Check contrast again after changing colours.</li>
  </ul>

  <h2 id="support">Support &amp; licence</h2>
  <p>Support: <a href="mailto:${esc(cfg.supportEmail)}">${esc(cfg.supportEmail)}</a> · ${esc(cfg.website)}</p>
  <p>See <code>LICENSE.txt</code>. A Single licence covers one website or store; an Extended licence covers client work on several sites. Reselling or redistributing the template files is not allowed.</p>
  <p>Fonts: ${[...new Set(fonts.map((f) => f.family))].map(esc).join(', ')}, under the SIL Open Font License 1.1. Artwork: original to this template.</p>
</main>
</body>
</html>
`;
}

export function licenseText(style, cfg) {
  return `${style.name} — ${cfg.brand}
Template licence · v${cfg.version}

1. DEFINITIONS
"Template" means the ${style.name} theme files, CSS, artwork, documentation and all
related files in this package. "End Product" means one website or online store.

2. SINGLE LICENCE
Grants you a non-exclusive, worldwide, perpetual licence to use and modify the
Template to create ONE End Product, for yourself or for one client. Using it for
another End Product requires another licence.

3. EXTENDED LICENCE
If you bought an Extended licence, you may use the Template to create End Products
for up to 10 clients. Each End Product may be used by one client only.

4. RESTRICTIONS
You may not resell, sublicense, share or redistribute the Template or any part of it
(including as a template, theme, kit or stock item), whether modified or not, and you
may not claim it as your own design. You may not submit it to theme stores or
marketplaces.

5. THIRD-PARTY COMPONENTS
Bundled fonts are licensed under the SIL Open Font License 1.1 and may be used under
the terms of that licence. Shopify and Squarespace are trademarks of their owners;
this Template is not affiliated with or endorsed by them.

6. WARRANTY
The Template is provided "as is", without warranty of any kind. In no event shall
${cfg.brand} be liable for any claim, damages or other liability arising from its use.

7. SUPPORT
Support is provided by email (${cfg.supportEmail}) for 6 months from purchase and
covers installation and the documented features.
`;
}

export function changelog(style, cfg) {
  return `# ${style.name} changelog

## ${cfg.version} — ${cfg.releaseDate}
- First release.
- Shopify Online Store 2.0 theme: passes Shopify Theme Check with no errors or warnings.
- Squarespace 7.1 design kit and Squarespace 7.0 Developer Platform template.
- WCAG 2.1 AA colour contrast (axe-core audit, desktop and mobile).
`;
}

export function listing(style, cfg) {
  const industry = INDUSTRY[style.slug] || 'local businesses';
  return `# ${style.name} — ${style.style} Website Template for ${industry.replace(/(^|, | & )(\w)/g, (m) => m.toUpperCase())}

**Short description:** ${style.tagline}. A ${style.style.toLowerCase()} website template for ${industry}, for Shopify and Squarespace.

**Price:** Single licence €${cfg.prices.single} · Extended licence €${cfg.prices.extended} · All-templates bundle €${cfg.prices.bundle}

## Description
${style.name} gives ${industry} a ${style.tagline.toLowerCase()} website that's ready to launch. The homepage covers what local customers look for: services with prices, opening hours and a map, reviews, a gallery and a booking/contact form. Everything can be edited without code.

## Features
- Shopify Online Store 2.0 theme: section-based editing, colour schemes, app blocks
- Full store support: variants, subscriptions, filtering, predictive search, customer accounts, multi-currency and multi-language
- Squarespace 7.1 design kit (custom CSS, fonts, images and a step-by-step build guide) plus a Squarespace 7.0 Developer template
- Mobile-first and fast: self-hosted fonts, responsive images, no heavy frameworks
- Accessible: WCAG 2.1 AA colour contrast, keyboard navigation and labelled forms
- 11 sibling design styles in the same theme, switchable from one setting (Shopify)
- Detailed documentation and 6 months of email support

## What's included
Shopify theme (.zip) · Squarespace 7.1 kit (.zip) · Squarespace 7.0 template (.zip) · Documentation (HTML) · Screenshots · Licence

## Tags
${[style.style, style.name, 'shopify theme', 'squarespace template', 'small business website', 'local business', ...industry.split(/, | & /)].map((t) => t.toLowerCase()).join(', ')}
`;
}
