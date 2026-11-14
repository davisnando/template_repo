# Squarespace

## What this repo builds
`dist/squarespace/<template>/` is a **Squarespace Developer Platform template**. It contains:
- `template.conf`
- `site.region`, with the navigation block
- LESS colour tweaks for the Style Editor
- self-hosted fonts
- a static homepage, `pages/home.page`

It follows the Developer Platform's structure, and `scripts/validate.mjs` checks the JSON-T tags, assets and fonts. It also passes the same WCAG AA audit as the Shopify themes.

## The rule that matters for selling
Developer Mode only exists on **Squarespace 7.0** sites. Templates for **7.1 / Fluid Engine**, which is what most buyers use and what template marketplaces sell, can't be made as code. They are built in the Squarespace editor and delivered by transferring or duplicating a finished site.

That leaves two ways to sell:
1. **Sell the code templates to 7.0 sites, or to developers.** This works today. Buyers install with git, as described in the README. The market is small.
2. **Sell 7.1 site templates (recommended).** Rebuild the 2–3 strongest designs in the 7.1 editor using native sections. Paste each design's CSS (`styles/<template>/style.css` plus `packages/core/base.css`) into *Custom CSS*, retargeted to 7.1 class names. Upload the SVG art and fonts as custom files. Then sell through Etsy, Creative Market or your own site, as a site transfer with a setup guide. This part has to be done by hand in Squarespace.
