// Default wording. Anything changed in Admin > Design and text is saved in settings.json under "text".
export const TEXT_GROUPS = [
  ['Menu', {
    navHome: ['Home', 'Home'], navShop: ['Shop', 'Shop'], navProducts: ['All products', 'All products'], navCategories: ['Categories', 'Categories'],
    navProjects: ['Projects', 'Projects'], navAbout: ['About us', 'About us'], navContact: ['Contact us', 'Contact us'],
  }],
  ['Buttons', {
    addToCart: ['Add to cart button', 'Add to cart'], buyNow: ['Buy now button', 'Buy now'], requestQuote: ['Quote button', 'Request a quote'],
    whatsappEnquiry: ['WhatsApp enquiry button', 'WhatsApp enquiry'], sendOrder: ['Send order button', 'Send order on WhatsApp'],
  }],
  ['Page headings', {
    shopTitle: ['Shop heading', 'Shop'], shopIntro: ['Shop introduction', 'Add priced products to your cart, or ask us for a quote. You send everything to us on WhatsApp.'],
    productsTitle: ['All products heading', 'All products'], productsIntro: ['All products introduction', 'Search by product name, code, category or subcategory.'],
    categoriesTitle: ['Categories heading', 'Product categories'], categoriesIntro: ['Categories introduction', 'Choose a category to see its products and subcategories.'],
    projectsTitle: ['Projects heading', 'Interior projects'], projectsIntro: ['Projects introduction', 'Ceiling and wall work.'],
    aboutTitle: ['About heading', 'About us'], contactTitle: ['Contact heading', 'Contact us'], contactIntro: ['Contact introduction', 'Visit the shop, call us or send a WhatsApp message.'],
    cartTitle: ['Cart heading', 'Shopping cart'], checkoutTitle: ['Checkout heading', 'Checkout'], checkoutIntro: ['Checkout introduction', 'Enter your details and check the order. Nothing is paid online.'],
  }],
];
export const DEFAULT_TEXT = Object.fromEntries(TEXT_GROUPS.flatMap(([, g]) => Object.entries(g).map(([k, v]) => [k, v[1]])));
/** Empty or missing entries fall back to the default wording. */
export const resolveText = (text) =>
  Object.fromEntries(Object.entries(DEFAULT_TEXT).map(([k, v]) => [k, typeof text?.[k] === 'string' && text[k].trim() ? text[k] : v]));
export const DEFAULT_LOGO = 'assets/logo/vijay-shree-logo.png';
