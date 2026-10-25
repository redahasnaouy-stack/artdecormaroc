function updateVariant(section) {
  const select = section.querySelector('[data-variant]');
  const button = section.querySelector('[data-add]');
  const price = section.querySelector('[data-price]');
  if (!select || !button) return;
  const update = () => {
    const option = select.selectedOptions[0];
    if (!option) return;
    button.disabled = option.dataset.available !== 'true';
    button.textContent = button.disabled ? 'Épuisé' : 'Ajouter au panier';
    if (price) price.textContent = option.dataset.price;
    const url = new URL(window.location.href);
    url.searchParams.set('variant', select.value);
    history.replaceState({}, '', url);
  };
  select.addEventListener('change', update);
}
document.querySelectorAll('[data-product-section]').forEach(updateVariant);
document.addEventListener('shopify:section:load', event => event.target.querySelectorAll('[data-product-section]').forEach(updateVariant));
