/* Local theme — progressive enhancement only; every feature works without JS. */
(() => {
  const debounce = (fn, wait = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };
  const fetchSection = async (url) => new DOMParser().parseFromString(await (await fetch(url)).text(), 'text/html');

  // Close <details> menus with Escape and when clicking outside.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('details[open].menu-drawer, details[open].search-modal, details[open].dropdown').forEach((d) => {
      d.removeAttribute('open');
      d.querySelector('summary')?.focus();
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('details[open].dropdown').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); });
  });
  document.querySelectorAll('details.search-modal').forEach((d) =>
    d.addEventListener('toggle', () => d.open && d.querySelector('input[type="search"]')?.focus()));

  // Predictive search (Section Rendering API).
  document.querySelectorAll('form[data-predictive-search]').forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    const results = document.getElementById(input.getAttribute('aria-controls'));
    if (!results) return;
    input.addEventListener('input', debounce(async () => {
      const q = input.value.trim();
      if (!q) { results.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      const url = `${form.dataset.predictiveSearch}?q=${encodeURIComponent(q)}&section_id=predictive-search&resources[limit]=4`;
      const doc = await fetchSection(url);
      results.innerHTML = doc.querySelector('.predictive-search__results')?.outerHTML || '';
      input.setAttribute('aria-expanded', results.innerHTML ? 'true' : 'false');
    }));
  });

  // Variant picker: keep the form's variant id, URL and price/buy area in sync.
  document.querySelectorAll('[data-variant-picker]').forEach((picker) => {
    const sectionId = picker.dataset.variantPicker;
    const section = picker.closest('[data-section]');
    const variants = JSON.parse(picker.querySelector('[data-variants]').textContent);
    picker.addEventListener('change', async () => {
      const selected = [...picker.querySelectorAll('select')].map((s) => s.value);
      const variant = variants.find((v) => v.options.every((o, i) => o === selected[i]));
      const idInput = section.querySelector('[data-variant-id]');
      const submit = section.querySelector('.product-form__submit');
      if (!variant) { if (submit) submit.disabled = true; return; }
      if (idInput) idInput.value = variant.id;
      section.querySelectorAll('form[id^="ProductInstallments"] input[name="id"]').forEach((i) => { i.value = variant.id; });
      const url = `${section.dataset.productUrl}?variant=${variant.id}`;
      history.replaceState({}, '', url);
      const doc = await fetchSection(`${url}&section_id=${sectionId}`);
      for (const id of [`Price-${sectionId}`]) {
        const fresh = doc.getElementById(id);
        const current = document.getElementById(id);
        if (fresh && current) current.innerHTML = fresh.innerHTML;
      }
      const freshBuy = doc.getElementById(`Buy-${sectionId}`);
      if (submit && freshBuy) {
        const freshSubmit = freshBuy.querySelector('.product-form__submit');
        submit.disabled = freshSubmit.disabled;
        submit.textContent = freshSubmit.textContent;
        const pickup = section.querySelector('.pickup');
        const freshPickup = freshBuy.querySelector('.pickup');
        if (pickup) pickup.replaceWith(freshPickup || document.createElement('span'));
        else if (freshPickup) document.getElementById(`Buy-${sectionId}`).append(freshPickup);
      }
    });
  });

  // Gift card recipient fields are only submitted when the merchant's customer opts in.
  document.querySelectorAll('[data-gift-card-recipient]').forEach((box) => {
    const toggle = box.querySelector('[data-gift-card-toggle]');
    const sync = () => box.querySelectorAll('.gift-card-recipient__fields :is(input, textarea)').forEach((f) => { f.disabled = !toggle.checked; });
    toggle.addEventListener('change', sync);
    sync();
  });

  // Filters and sorting apply as soon as they change.
  document.querySelectorAll('[data-facets]').forEach((form) => {
    form.querySelector('.facets__apply')?.classList.add('visually-hidden');
    form.addEventListener('change', debounce(() => form.requestSubmit(), 400));
  });

  // Cart quantities update on change.
  document.querySelectorAll('[data-cart-form] .cart__qty').forEach((input) =>
    input.addEventListener('change', debounce(() => input.form.requestSubmit(input.form.querySelector('[name="update"]')), 500)));

  // Product recommendations.
  document.querySelectorAll('[data-recommendations]').forEach(async (el) => {
    if (el.children.length) return;
    const doc = await fetchSection(el.dataset.recommendations);
    const fresh = doc.querySelector('[data-recommendations]');
    if (fresh) el.innerHTML = fresh.innerHTML;
  });

  // Address forms: country → province select using Shopify's country data.
  document.querySelectorAll('[data-country-select]').forEach((country) => {
    const province = document.getElementById(country.dataset.provinceTarget);
    const wrapper = province.closest('[data-province-wrapper]');
    const fill = () => {
      const option = country.options[country.selectedIndex];
      const provinces = option ? JSON.parse(option.dataset.provinces || '[]') : [];
      province.innerHTML = provinces.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
      wrapper.hidden = provinces.length === 0;
      if (province.dataset.default) province.value = province.dataset.default;
    };
    if (country.dataset.default) country.value = country.dataset.default;
    country.addEventListener('change', () => { province.dataset.default = ''; fill(); });
    fill();
  });

  document.querySelectorAll('form[data-confirm]').forEach((form) =>
    form.addEventListener('submit', (e) => { if (!window.confirm(form.dataset.confirm)) e.preventDefault(); }));
})();
