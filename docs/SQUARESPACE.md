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

Every release package covers both (see `npm run release`). That leaves two ways to sell:
1. **Sell the code templates to 7.0 sites, or to developers.** This works today. Buyers install with git, as described in the README. The market is small.
2. **Sell for 7.1 (recommended).** Each package includes a **7.1 design kit**: Custom CSS written against 7.1's markup, the fonts to upload, the artwork as JPG, and a guide with the exact colours, fonts and section-by-section content. A buyer applies it to their own 7.1 site, which is how CSS-kit templates are commonly sold.
   - To also sell *finished 7.1 sites* (site transfer or duplication), build one master site per template by following the guide.
   - That master site can't be generated from code; Squarespace offers no API for it.
   - The kit CSS parses cleanly but hasn't been tested on a live 7.1 site. Check it on your first master site.
