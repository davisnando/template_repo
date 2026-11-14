// Shopify-only templates (pages, products, cart…). Kept deliberately simple and on-brand:
// they reuse the shared tokens/classes so every style restyles them automatically.

const schema = (name) => `\n{% schema %}\n${JSON.stringify({ name, tag: 'section', class: 'section', settings: [] }, null, 2)}\n{% endschema %}\n`;

const productCard = `<a class="card" href="{{ product.url }}">
        <div class="card__media">{%- if product.featured_image -%}{{ product.featured_image | image_url: width: 800 | image_tag: loading: 'lazy', widths: '400, 600, 800' }}{%- endif -%}</div>
        <h3 class="card__title">{{ product.title | escape }}</h3>
        <p class="card__price">{{ product.price | money }}</p>
      </a>`;

export const commerceSections = {
  'main-page': {
    template: 'page',
    liquid: `<div class="container container--narrow">
  <h1 class="section__title">{{ page.title | escape }}</h1>
  <div class="rte">{{ page.content }}</div>
</div>${schema('Page')}`,
  },
  'main-product': {
    template: 'product',
    liquid: `<div class="container product">
  <div class="product__media">{%- if product.featured_image -%}{{ product.featured_image | image_url: width: 1400 | image_tag: widths: '600, 900, 1200, 1400', sizes: '(min-width: 900px) 50vw, 100vw' }}{%- endif -%}</div>
  <div class="product__info">
    <h1 class="section__title">{{ product.title | escape }}</h1>
    <p class="product__price">{{ product.selected_or_first_available_variant.price | money }}</p>
    {%- form 'product', product, class: 'product__form' -%}
      {%- unless product.has_only_default_variant -%}
        <div class="field"><label for="variant">Option</label>
          <select id="variant" name="id">{%- for variant in product.variants -%}<option value="{{ variant.id }}"{% if variant == product.selected_or_first_available_variant %} selected{% endif %}{% unless variant.available %} disabled{% endunless %}>{{ variant.title | escape }} — {{ variant.price | money }}</option>{%- endfor -%}</select>
        </div>
      {%- else -%}
        <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
      {%- endunless -%}
      <button class="btn btn--primary" type="submit"{% unless product.available %} disabled{% endunless %}>{% if product.available %}{{ 'general.add_to_cart' | t }}{% else %}{{ 'general.sold_out' | t }}{% endif %}</button>
    {%- endform -%}
    <div class="rte">{{ product.description }}</div>
  </div>
</div>${schema('Product')}`,
  },
  'main-collection': {
    template: 'collection',
    liquid: `<div class="container">
  <div class="section__head"><h1 class="section__title">{{ collection.title | escape }}</h1>{%- if collection.description != blank -%}<div class="section__intro rte">{{ collection.description }}</div>{%- endif -%}</div>
  {%- paginate collection.products by 12 -%}
    <div class="product-grid">{%- for product in collection.products -%}${productCard}{%- else -%}<p>No products yet.</p>{%- endfor -%}</div>
    {%- if paginate.pages > 1 -%}<nav class="pagination">{{ paginate | default_pagination }}</nav>{%- endif -%}
  {%- endpaginate -%}
</div>${schema('Collection')}`,
  },
  'main-list-collections': {
    template: 'list-collections',
    liquid: `<div class="container">
  <div class="section__head"><h1 class="section__title">Collections</h1></div>
  <div class="product-grid">{%- for collection in collections -%}<a class="card" href="{{ collection.url }}"><div class="card__media">{%- if collection.featured_image -%}{{ collection.featured_image | image_url: width: 800 | image_tag: loading: 'lazy' }}{%- endif -%}</div><h3 class="card__title">{{ collection.title | escape }}</h3></a>{%- endfor -%}</div>
</div>${schema('Collections list')}`,
  },
  'main-cart': {
    template: 'cart',
    liquid: `<div class="container container--narrow">
  <h1 class="section__title">{{ 'general.cart' | t }}</h1>
  {%- if cart.item_count > 0 -%}
  <form action="{{ routes.cart_url }}" method="post" class="cart">
    <table class="cart__table"><tbody>
    {%- for item in cart.items -%}
      <tr><td><a href="{{ item.url }}">{{ item.product.title | escape }}</a>{%- unless item.variant.is_default_variant -%}<br><small>{{ item.variant.title | escape }}</small>{%- endunless -%}</td>
      <td><input class="cart__qty" type="number" name="updates[]" value="{{ item.quantity }}" min="0" aria-label="Quantity"></td>
      <td>{{ item.final_line_price | money }}</td></tr>
    {%- endfor -%}
    </tbody></table>
    <p class="cart__total">Total: <strong>{{ cart.total_price | money }}</strong></p>
    <div class="hero__actions"><button class="btn btn--ghost" type="submit" name="update">Update</button><button class="btn btn--primary" type="submit" name="checkout">Check out</button></div>
  </form>
  {%- else -%}<p>Your cart is empty. <a href="{{ routes.all_products_collection_url }}">Continue shopping</a></p>{%- endif -%}
</div>${schema('Cart')}`,
  },
  'main-search': {
    template: 'search',
    liquid: `<div class="container">
  <form action="{{ routes.search_url }}" method="get" class="search-form" role="search"><div class="field"><label for="q">{{ 'general.search' | t }}</label><input id="q" type="search" name="q" value="{{ search.terms | escape }}"></div><button class="btn btn--primary" type="submit">{{ 'general.search' | t }}</button></form>
  {%- if search.performed -%}<div class="product-grid">{%- for item in search.results -%}<a class="card" href="{{ item.url }}"><h3 class="card__title">{{ item.title | escape }}</h3></a>{%- else -%}<p>No results.</p>{%- endfor -%}</div>{%- endif -%}
</div>${schema('Search')}`,
  },
  'main-blog': {
    template: 'blog',
    liquid: `<div class="container">
  <div class="section__head"><h1 class="section__title">{{ blog.title | escape }}</h1></div>
  {%- paginate blog.articles by 9 -%}<div class="product-grid">{%- for article in blog.articles -%}<a class="card" href="{{ article.url }}"><div class="card__media">{%- if article.image -%}{{ article.image | image_url: width: 800 | image_tag: loading: 'lazy' }}{%- endif -%}</div><h3 class="card__title">{{ article.title | escape }}</h3><p class="card__price">{{ article.published_at | date: '%B %d, %Y' }}</p></a>{%- endfor -%}</div>{%- if paginate.pages > 1 -%}<nav class="pagination">{{ paginate | default_pagination }}</nav>{%- endif -%}{%- endpaginate -%}
</div>${schema('Blog')}`,
  },
  'main-article': {
    template: 'article',
    liquid: `<article class="container container--narrow">
  <p class="eyebrow">{{ article.published_at | date: '%B %d, %Y' }}</p>
  <h1 class="section__title">{{ article.title | escape }}</h1>
  {%- if article.image -%}<div class="article__media">{{ article.image | image_url: width: 1600 | image_tag }}</div>{%- endif -%}
  <div class="rte">{{ article.content }}</div>
</article>${schema('Article')}`,
  },
  'main-404': {
    template: '404',
    liquid: `<div class="container container--narrow"><p class="eyebrow">404</p><h1 class="section__title">Page not found</h1><p class="section__intro">The page you were looking for doesn't exist.</p><p style="margin-top:2rem"><a class="btn btn--primary" href="{{ routes.root_url }}">Back home</a></p></div>${schema('404')}`,
  },
};

export const commerceCss = `/* Shopify-only templates */
.shopify-section > .section, .section.main-section { padding: var(--section-pad) 0; }
[class*="shopify-section--main"], .shopify-section .container--narrow { padding-block: clamp(48px, 7vw, 96px); }
.container--narrow { max-width: calc(760px + var(--gutter) * 2); }
.rte { margin-top: 1.5rem; color: var(--c-muted); }
.rte p + p { margin-top: 1em; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
.card { text-decoration: none; display: grid; gap: .6rem; }
.card__media { aspect-ratio: 1; background: var(--c-surface); border-radius: var(--radius); overflow: hidden; }
.card__media img { width: 100%; height: 100%; object-fit: cover; }
.card__title { font-size: 1.1rem; }
.card__price, .product__price { color: var(--c-muted); }
.product { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(32px, 6vw, 80px); padding-block: clamp(48px, 7vw, 96px); }
.product__media { border-radius: var(--radius); overflow: hidden; background: var(--c-surface); }
.product__price { font-size: 1.4rem; margin: 1rem 0 2rem; }
.product__form { display: grid; gap: 1rem; max-width: 420px; }
.product__form select, .search-form input, .cart__qty { font: inherit; padding: .8em 1em; border: var(--border-w) solid var(--c-border); border-radius: calc(var(--radius) / 2); background: var(--c-bg); color: var(--c-text); }
.cart__table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
.cart__table td { padding: 1rem 0; border-bottom: var(--border-w) solid var(--c-border); }
.cart__qty { width: 80px; }
.cart__total { font-size: 1.2rem; margin-bottom: 1.5rem; }
.search-form { display: flex; gap: 1rem; align-items: end; margin-bottom: 3rem; }
.pagination { margin-top: 3rem; display: flex; gap: 1rem; }
@media (max-width: 900px) { .product { grid-template-columns: 1fr; } }
`;
