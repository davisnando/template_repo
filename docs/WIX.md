# Wix

## How Wix templates work
Wix has no theme upload: a Wix template is a site built in the **Wix Studio** editor, or the classic Wix Editor, that buyers copy. So, as with Squarespace 7.1, this repo ships a **design kit** per template (`<Name>-Wix-Studio-Kit.zip` in every release package), not an importable file. It contains:
- `global.css`: paste into Wix Studio → Code → CSS. It styles elements through custom classes (`lbt-btn`, `lbt-card`, …).
- `fonts/`: upload under Site Styles → Text.
- `images/`: the artwork as JPG.
- The *Wix Studio setup* chapter in `Documentation.html`: theme colours, text themes, which class goes on which element, and the section-by-section content.

## Selling
1. **Build one master site per template** in Wix Studio by following the guide (about 45–60 minutes each). There's no API or import for this, so it has to be done in the editor.
2. Then pick one or both ways to sell:
   - **Wix Marketplace:** only for Wix Studio partners. Wix reviews each template before listing (up to 60 business days) and checks quality, uniqueness and *exclusivity*, so read the current terms before also selling the same design elsewhere. Marketplace purchases are currently limited to buyers in the US and Canada.
   - **Anywhere else:** Wix lets you sell custom templates built in the Studio Editor or Wix Editor on any platform, delivered through Wix's template transfer.
3. You can also sell the kit itself, like the Squarespace 7.1 kit, to people who build their own Wix site.

The `global.css` files parse cleanly but haven't been tested in a live Wix Studio site. Check them on your first master site.
