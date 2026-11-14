// Single source of truth for every section.
// Each section is rendered through a platform context (`c`), so the same markup
// compiles to Liquid (Shopify), static HTML (Squarespace pages) and the preview.
//
// Context API
//   c.t(id)        escaped text            c.text(id)  escaped multi-line text
//   c.url(id)      link href               c.opt(id)   select value (used in class names)
//   c.img(id,o)    responsive image        c.when(id, html)  render html only if id is set
//   c.each(fn)     repeat blocks           c.attrs()   editor attributes for a block
//   c.siteName / c.nav(cls) / c.form(html) / c.asset(file) / c.year

const btn = (c, label, link, kind = 'primary') =>
  c.when(label, `<a class="btn btn--${kind}" href="${c.url(link)}">${c.t(label)}</a>`);

export const sections = {
  header: {
    name: 'Header',
    settings: [
      { id: 'announcement', type: 'text', label: 'Announcement bar' },
      { id: 'cta_label', type: 'text', label: 'Button label' },
      { id: 'cta_link', type: 'text', label: 'Button link' },
    ],
    render: (c) => `
${c.when('announcement', `<aside class="announcement" aria-label="${c.tr('sections.announcement.label', 'Announcement')}"><p>${c.t('announcement')}</p></aside>`)}
<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="${c.root}"><span class="brand__mark" aria-hidden="true"></span><span class="brand__name">${c.siteName}</span></a>
    ${c.nav('site-nav')}
    ${btn(c, 'cta_label', 'cta_link', 'small')}
  </div>
</header>`,
  },

  hero: {
    name: 'Hero',
    settings: [
      { id: 'layout', type: 'select', label: 'Layout', options: ['split', 'stacked', 'centered', 'full'] },
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
      { id: 'subheading', type: 'textarea', label: 'Subheading' },
      { id: 'cta_label', type: 'text', label: 'Primary button label' },
      { id: 'cta_link', type: 'text', label: 'Primary button link' },
      { id: 'cta2_label', type: 'text', label: 'Secondary button label' },
      { id: 'cta2_link', type: 'text', label: 'Secondary button link' },
      { id: 'image', type: 'image_picker', label: 'Image' },
      { id: 'note', type: 'text', label: 'Small note under buttons' },
    ],
    block: {
      type: 'stat', name: 'Stat', max: 4,
      settings: [
        { id: 'value', type: 'text', label: 'Value' },
        { id: 'label', type: 'text', label: 'Label' },
      ],
    },
    render: (c) => `
<section class="hero hero--${c.opt('layout')}${c.scheme()}">
  <div class="hero__media">${c.img('image', { cls: 'hero__img', eager: true, sizes: '100vw' })}</div>
  <div class="container hero__inner">
    <div class="hero__copy">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h1 class="hero__title">${c.t('heading')}</h1>
      ${c.when('subheading', `<p class="hero__sub">${c.text('subheading')}</p>`)}
      <div class="hero__actions">${btn(c, 'cta_label', 'cta_link')}${btn(c, 'cta2_label', 'cta2_link', 'ghost')}</div>
      ${c.when('note', `<p class="hero__note">${c.t('note')}</p>`)}
    </div>
    <dl class="hero__stats">${c.each((b) => `<div class="stat" ${b.attrs()}><dt>${b.t('label')}</dt><dd>${b.t('value')}</dd></div>`)}</dl>
  </div>
</section>`,
  },

  services: {
    name: 'Services',
    settings: [
      { id: 'layout', type: 'select', label: 'Layout', options: ['cards', 'list', 'grid', 'bento'] },
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
      { id: 'intro', type: 'textarea', label: 'Intro' },
    ],
    block: {
      type: 'service', name: 'Service', max: 9,
      settings: [
        { id: 'title', type: 'text', label: 'Title' },
        { id: 'text', type: 'textarea', label: 'Description' },
        { id: 'price', type: 'text', label: 'Price / duration' },
      ],
    },
    render: (c) => `
<section class="section services services--${c.opt('layout')}${c.scheme()}" id="services">
  <div class="container">
    <div class="section__head">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h2 class="section__title">${c.t('heading')}</h2>
      ${c.when('intro', `<p class="section__intro">${c.text('intro')}</p>`)}
    </div>
    <ol class="services__list">${c.each((b) => `
      <li class="service" ${b.attrs()}>
        <h3 class="service__title">${b.t('title')}</h3>
        <p class="service__text">${b.text('text')}</p>
        ${b.when('price', `<p class="service__price">${b.t('price')}</p>`)}
      </li>`)}
    </ol>
  </div>
</section>`,
  },

  about: {
    name: 'About',
    settings: [
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
      { id: 'text', type: 'textarea', label: 'Text' },
      { id: 'signature', type: 'text', label: 'Signature' },
      { id: 'image', type: 'image_picker', label: 'Image' },
    ],
    block: {
      type: 'point', name: 'Highlight', max: 4,
      settings: [
        { id: 'title', type: 'text', label: 'Title' },
        { id: 'text', type: 'text', label: 'Text' },
      ],
    },
    render: (c) => `
<section class="section about${c.scheme()}" id="about">
  <div class="container about__inner">
    <figure class="about__media">${c.img('image', { cls: 'about__img' })}</figure>
    <div class="about__copy">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h2 class="section__title">${c.t('heading')}</h2>
      <p class="about__text">${c.text('text')}</p>
      <ul class="about__points">${c.each((b) => `<li ${b.attrs()}><strong>${b.t('title')}</strong><span>${b.t('text')}</span></li>`)}</ul>
      ${c.when('signature', `<p class="about__signature">${c.t('signature')}</p>`)}
    </div>
  </div>
</section>`,
  },

  gallery: {
    name: 'Gallery',
    settings: [
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
    ],
    block: {
      type: 'image', name: 'Image', max: 8,
      settings: [
        { id: 'image', type: 'image_picker', label: 'Image' },
        { id: 'caption', type: 'text', label: 'Caption' },
      ],
    },
    render: (c) => `
<section class="section gallery${c.scheme()}" id="gallery">
  <div class="container">
    <div class="section__head">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h2 class="section__title">${c.t('heading')}</h2>
    </div>
    <div class="gallery__grid">${c.each((b) => `
      <figure class="gallery__item" ${b.attrs()}>${b.img('image', { cls: 'gallery__img', alt: 'caption', sizes: '(min-width: 990px) 25vw, 50vw' })}${b.when('caption', `<figcaption>${b.t('caption')}</figcaption>`)}</figure>`)}
    </div>
  </div>
</section>`,
  },

  testimonials: {
    name: 'Testimonials',
    settings: [
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
      { id: 'rating', type: 'text', label: 'Rating summary' },
    ],
    block: {
      type: 'quote', name: 'Testimonial', max: 6,
      settings: [
        { id: 'quote', type: 'textarea', label: 'Quote' },
        { id: 'author', type: 'text', label: 'Author' },
        { id: 'detail', type: 'text', label: 'Detail' },
      ],
    },
    render: (c) => `
<section class="section testimonials${c.scheme()}" id="reviews">
  <div class="container">
    <div class="section__head">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h2 class="section__title">${c.t('heading')}</h2>
      ${c.when('rating', `<p class="rating"><span class="rating__stars" aria-hidden="true">★★★★★</span> ${c.t('rating')}</p>`)}
    </div>
    <div class="testimonials__grid">${c.each((b) => `
      <blockquote class="quote" ${b.attrs()}>
        <p class="quote__text">${b.text('quote')}</p>
        <footer class="quote__by"><strong>${b.t('author')}</strong>${b.when('detail', `<span>${b.t('detail')}</span>`)}</footer>
      </blockquote>`)}
    </div>
  </div>
</section>`,
  },

  visit: {
    name: 'Visit / hours',
    settings: [
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
      { id: 'address', type: 'textarea', label: 'Address' },
      { id: 'phone', type: 'text', label: 'Phone' },
      { id: 'email', type: 'text', label: 'Email' },
      { id: 'directions_link', type: 'text', label: 'Directions link' },
      { id: 'image', type: 'image_picker', label: 'Map / location image' },
    ],
    block: {
      type: 'hours', name: 'Opening hours row', max: 7,
      settings: [
        { id: 'day', type: 'text', label: 'Day(s)' },
        { id: 'time', type: 'text', label: 'Time' },
      ],
    },
    render: (c) => `
<section class="section visit${c.scheme()}" id="visit">
  <div class="container visit__inner">
    <div class="visit__copy">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h2 class="section__title">${c.t('heading')}</h2>
      <table class="hours"><tbody>${c.each((b) => `<tr ${b.attrs()}><th scope="row">${b.t('day')}</th><td>${b.t('time')}</td></tr>`)}</tbody></table>
      <address class="visit__contact">
        <p>${c.text('address')}</p>
        ${c.when('phone', `<p><a href="tel:${c.t('phone')}">${c.t('phone')}</a></p>`)}
        ${c.when('email', `<p><a href="mailto:${c.t('email')}">${c.t('email')}</a></p>`)}
      </address>
      ${c.when('directions_link', `<a class="btn btn--ghost" href="${c.url('directions_link')}">${c.tr('sections.visit.directions', 'Get directions')}</a>`)}
    </div>
    <figure class="visit__media">${c.img('image', { cls: 'visit__img' })}</figure>
  </div>
</section>`,
  },

  contact: {
    name: 'Contact / booking',
    settings: [
      { id: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'heading', type: 'text', label: 'Heading' },
      { id: 'text', type: 'textarea', label: 'Text' },
      { id: 'button', type: 'text', label: 'Submit label' },
    ],
    render: (c) => `
<section class="section contact${c.scheme()}" id="contact">
  <div class="container contact__inner">
    <div class="contact__copy">
      ${c.when('eyebrow', `<p class="eyebrow">${c.t('eyebrow')}</p>`)}
      <h2 class="section__title">${c.t('heading')}</h2>
      <p class="section__intro">${c.text('text')}</p>
    </div>
    ${c.form(`
      <div class="field"><label for="cf-name-${c.uid}">${c.tr('sections.contact.name', 'Name')}</label><input id="cf-name-${c.uid}" type="text" name="contact[name]" autocomplete="name" required></div>
      <div class="field"><label for="cf-email-${c.uid}">${c.tr('sections.contact.email', 'Email')}</label><input id="cf-email-${c.uid}" type="email" name="contact[email]" autocomplete="email" required></div>
      <div class="field field--full"><label for="cf-msg-${c.uid}">${c.tr('sections.contact.message', 'How can we help?')}</label><textarea id="cf-msg-${c.uid}" name="contact[body]" rows="4"></textarea></div>
      <button class="btn btn--primary" type="submit">${c.t('button')}</button>`)}
  </div>
</section>`,
  },

  footer: {
    name: 'Footer',
    settings: [
      { id: 'tagline', type: 'textarea', label: 'Tagline' },
      { id: 'address', type: 'textarea', label: 'Address' },
      { id: 'phone', type: 'text', label: 'Phone' },
      { id: 'instagram', type: 'text', label: 'Instagram URL' },
      { id: 'facebook', type: 'text', label: 'Facebook URL' },
    ],
    render: (c) => `
<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__brand">
      <a class="brand" href="${c.root}"><span class="brand__mark" aria-hidden="true"></span><span class="brand__name">${c.siteName}</span></a>
      <p>${c.text('tagline')}</p>
    </div>
    <div><h2>${c.tr('sections.footer.visit', 'Visit')}</h2><p>${c.text('address')}</p>${c.when('phone', `<p><a href="tel:${c.t('phone')}">${c.t('phone')}</a></p>`)}</div>
    <div><h2>${c.tr('sections.footer.explore', 'Explore')}</h2>${c.nav('footer-nav')}</div>
    <div><h2>${c.tr('sections.footer.follow', 'Follow')}</h2><p class="socials">${c.when('instagram', `<a href="${c.url('instagram')}">Instagram</a>`)}${c.when('facebook', `<a href="${c.url('facebook')}">Facebook</a>`)}</p></div>
  </div>
  <div class="container site-footer__legal"><p>&copy; ${c.year} ${c.siteName}. ${c.tr('sections.footer.rights', 'All rights reserved.')}</p></div>
</footer>`,
  },
};

// Sections that live in the page body (header/footer are global).
export const bodySections = ['hero', 'services', 'about', 'gallery', 'testimonials', 'visit', 'contact'];
