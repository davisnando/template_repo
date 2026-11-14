# Shopify Theme Store submission

What to submit: **`dist/shopify/local`**. It's one theme, *Local*, with all 12 designs as presets, zipped as `dist/packages/shopify-local.zip`. The Theme Store accepts one codebase per theme, so the 12 designs go in as styles (presets) of a single theme, not as 12 separate themes.

The per-design builds (`dist/shopify/aurum`, …) contain the same theme with that design pre-selected. Use them to sell outside the Theme Store, for example on your own site or ThemeForest.

## Done in code, and verified

| Area | What the theme does | How it's checked |
|---|---|---|
| Code quality | Online Store 2.0: JSON templates, section groups for header and footer, app blocks (`@app`) in the product page plus an *Apps* section | **Theme Check: 0 errors, 0 warnings** on all 13 builds (`npm run check:shopify`) |
| Required templates | index, product, collection, list-collections, search, cart, page, page.contact, blog, article, 404, password, gift card, plus all 7 customer templates | `scripts/validate.mjs` |
| Product page | Media gallery (image, video, 3D), variant picker that keeps the URL in sync, quantity rules, unit price, sale price, sold-out state, dynamic checkout buttons, Shop Pay installments (`payment_terms`), selling plans (subscriptions), gift card recipient form, pickup availability, product recommendations, share, collapsible tabs, structured data | Theme Check |
| Discovery | Storefront filtering (list and price-range filters, active filters, clear all), sorting, pagination, predictive search through the Section Rendering API, search filters | Theme Check |
| Cart | Line-item properties, discounts, selling-plan names, quantity updates, cart note, taxes message, additional checkout buttons | Theme Check |
| Localization | Country/currency and language selectors; every customer-facing string comes from `locales/en.default.json` | Theme Check (TranslationKeyExists) |
| Theming | Color schemes (`color_scheme_group`, 3 per preset) that every section can pick from, a design-style setting, favicon, logo, social links | Theme Check (schema validation) |
| Performance | No third-party requests: fonts are self-hosted on Shopify's CDN; responsive `image_url` + `srcset` with width/height on every image; one deferred JS file; no frameworks | Theme Check (RemoteAsset, ImgWidthAndHeight, ParserBlockingScript) |
| Accessibility | Skip link, focus styles, labelled forms, landmarks, `aria-live` search results, reduced-motion support, WCAG AA colour contrast in all 12 palettes | **axe-core WCAG 2.1 AA: 0 violations** on all 12 designs, desktop and mobile (`npm run check:a11y`) |

## Still needed: can't be done from the repo

1. **Partner account.** Create one and submit through the Partner Dashboard (Themes → Theme Store).
2. **Demo stores.** You need one development store per preset. Each must show products and catalog size that match the industry the preset is tagged with; the May 2025 rules require this.
3. **Lighthouse scores on a real store.** Shopify measures performance and accessibility on the home, product and collection pages of your demo store. Run Lighthouse there; a local preview can't stand in for it.
4. **How many presets to submit.** Check the current requirements page for the limit on presets per theme. If 12 is too many, set `THEME_STORE_PRESETS` (see below) to the strongest designs and submit the others later as separate *themes*. They would need clearly distinct code, not just different presets.
5. **Listing assets.** Theme and preset names, desktop and mobile screenshots at Shopify's required sizes, a description, and pricing.
6. **Documentation and support URLs.** `theme_info` points at this repository's README and Issues pages. Replace them with your own docs site and support contact before submitting.
7. **Manual review.** Shopify also tests design quality and usability by hand. Expect a feedback round.

### Limiting presets in the submission
In `packages/shopify/build.js`, `listStyles()` decides which designs are bundled. To submit a subset, filter that list, for example `.filter((s) => ['aurum', 'tessera', 'folio', 'meridian'].includes(s.slug))`, then rebuild.

## Re-running the checks
```bash
npm run build && npm run check
```
