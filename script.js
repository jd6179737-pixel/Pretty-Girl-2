const cartList = document.getElementById('cart-list');
const cartCount = document.getElementById('cart-count');
let filterButtons = document.querySelectorAll('.filter-option');
let productCards = document.querySelectorAll('.product-card');
const toast = document.getElementById('toast');
const newsletterForm = document.getElementById('newsletter-form');
const ownerAccess = document.getElementById('owner-access');
const userModeButton = document.getElementById('user-mode');
const adminModal = document.getElementById('admin-modal');
const closeAdmin = document.getElementById('close-admin');
const adminForm = document.getElementById('admin-form');
const adminProducts = document.getElementById('admin-products');
const resetStore = document.getElementById('reset-store');
const addProductButton = document.getElementById('add-product');
const adminLogoPreview = document.getElementById('admin-logo-preview');
const previewStoreButton = document.getElementById('preview-store');
const productGrid = document.querySelector('.product-grid');
const searchButton = document.getElementById('search-button');
const searchBar = document.getElementById('search-bar');
const searchForm = document.getElementById('search-form');
const productSearch = document.getElementById('product-search');
const cartTrigger = document.getElementById('cart-trigger');
const cartBox = document.querySelector('.cart-box');
const adminAccessForm = document.getElementById('admin-access-form');
const ownerPin = document.getElementById('owner-pin');
const adminAccessError = document.getElementById('admin-access-error');
const previewAuthModal = document.getElementById('preview-auth-modal');
const previewAuthForm = document.getElementById('preview-auth-form');
const previewAuthError = document.getElementById('preview-auth-error');
const cancelPreviewButton = document.getElementById('cancel-preview');
const authGate = document.getElementById('auth-gate');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showLoginButton = document.getElementById('show-login');
const showRegisterButton = document.getElementById('show-register');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const authOwnerAccess = document.getElementById('auth-owner-access');
const logoutButton = document.getElementById('logout-button');
const ordersButton = document.getElementById('orders-button');
const orderHistoryModal = document.getElementById('order-history-modal');
const orderHistoryList = document.getElementById('order-history-list');
const closeOrderHistory = document.getElementById('close-order-history');
const shippingThreshold = document.getElementById('shipping-threshold');
const checkoutButton = document.getElementById('checkout-button');
const shippingModal = document.getElementById('shipping-modal');
const shippingForm = document.getElementById('shipping-form');
const shippingOrderCount = document.getElementById('shipping-order-count');
const closeShipping = document.getElementById('close-shipping');
const orderCodeModal = document.getElementById('order-code-modal');
const deliveryCodeDisplay = document.getElementById('delivery-code');
const closeOrderCode = document.getElementById('close-order-code');
const adminOrders = document.getElementById('admin-orders');
const productLightbox = document.getElementById('product-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxPrice = document.getElementById('lightbox-price');
const lightboxDescription = document.getElementById('lightbox-description');
const lightboxStock = document.getElementById('lightbox-stock');
const lightboxSize = document.getElementById('lightbox-size');
const lightboxAdd = document.getElementById('lightbox-add');
const lightboxPrevious = document.getElementById('lightbox-previous');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxClose = document.getElementById('lightbox-close');

const storeKey = 'vela-atelier-store';
const usersKey = 'vela-atelier-users';
const userSessionKey = 'vela-atelier-current-user';
const ordersKey = 'vela-atelier-orders';
const customerDetailsKey = 'vela-atelier-customer-details';
const ownerPassword = 'vela2026';
const minimumShippingItems = 4;
const orderCancellationWindow = 7 * 24 * 60 * 60 * 1000;
const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];
const defaultStock = 10;
const defaultStore = {
  storeName: document.querySelector('.brand-name').textContent,
  storeLogo: '',
  heroEyebrow: document.getElementById('hero-eyebrow').textContent,
  heroTitle: document.getElementById('hero-title').textContent,
  heroText: document.getElementById('hero-text').textContent.trim(),
  benefits: {
    shipping: { title: 'Envío gratis', detail: 'Desde $120' },
    warranty: { title: 'Garantía', detail: '30 días' },
    gifts: { title: 'Regalos', detail: 'Con cada compra' },
    support: { title: 'Soporte', detail: 'Atención 24/7' },
  },
  products: {},
};

document.querySelectorAll('.product-card').forEach((card) => {
  const id = card.dataset.productId;
  defaultStore.products[id] = {
    category: card.dataset.category,
    name: card.querySelector('h3').textContent,
    price: card.querySelector('.price').textContent,
    description: card.querySelector('.product-info p').textContent,
    image: card.querySelector('.product-media img').src,
    images: [card.querySelector('.product-media img').src],
    sizes: [...defaultSizes],
    stock: defaultStock,
  };
});

let cartItems = [];
let activeFilter = 'all';
let searchQuery = '';
let isUserAuthenticated = false;
let ownerOpenedFromAuth = false;
let isOwnerPreview = false;
let currentUsername = '';
let lightboxImages = [];
let lightboxIndex = 0;
let lightboxProductName = '';
let lightboxProductCard = null;
let lastLightboxTrigger = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function updateCart() {
  cartCount.textContent = `(${cartItems.length})`;
  checkoutButton.disabled = cartItems.length < minimumShippingItems;

  if (cartItems.length < minimumShippingItems) {
    const remaining = minimumShippingItems - cartItems.length;
    shippingThreshold.textContent = cartItems.length === 0
      ? `Agrega ${minimumShippingItems} productos para solicitar envío.`
      : `Agrega ${remaining} producto${remaining === 1 ? '' : 's'} más para solicitar envío.`;
  } else {
    shippingThreshold.textContent = 'Mínimo de envío cumplido. Puedes solicitar tu pedido.';
  }

  if (cartItems.length === 0) {
    cartList.innerHTML = '<li>Tu carrito está vacío</li>';
    return;
  }

  cartList.innerHTML = cartItems.map((item) => `<li>${escapeHtml(item.name)} · Talla ${escapeHtml(item.size)}</li>`).join('');
}

function cloneStore(store) {
  return JSON.parse(JSON.stringify(store));
}

function normalizeUsername(username) {
  return username.trim().toLocaleLowerCase();
}

function getAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(usersKey) || '{}');
    return accounts && typeof accounts === 'object' && !Array.isArray(accounts) ? accounts : {};
  } catch {
    return {};
  }
}

function getSavedCustomerDetails() {
  if (!currentUsername) return null;
  try {
    const customerDetails = JSON.parse(localStorage.getItem(customerDetailsKey) || '{}');
    return customerDetails[normalizeUsername(currentUsername)] || null;
  } catch {
    return null;
  }
}

function prefillShippingForm() {
  shippingForm.reset();
  const details = getSavedCustomerDetails();
  if (!details) return;

  shippingForm.elements.recipient.value = details.recipient || '';
  shippingForm.elements.phone.value = details.phone || '';
  shippingForm.elements.location.value = details.location || '';
  [...shippingForm.querySelectorAll('[name="paymentMethod"]')].forEach((option) => {
    option.checked = option.value === details.paymentMethod;
  });
}

function saveCustomerDetails(details) {
  if (!currentUsername) return;
  const customerDetails = JSON.parse(localStorage.getItem(customerDetailsKey) || '{}');
  customerDetails[normalizeUsername(currentUsername)] = details;
  localStorage.setItem(customerDetailsKey, JSON.stringify(customerDetails));
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function generateDeliveryCode() {
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  return String(randomValue[0] % 1000000).padStart(6, '0');
}

async function hashPassword(password, saltHex) {
  const salt = Uint8Array.from(saltHex.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 120000,
    hash: 'SHA-256',
  }, passwordKey, 256);

  return bytesToHex(new Uint8Array(derivedBits));
}

function selectAuthForm(mode) {
  const showRegister = mode === 'register';
  loginForm.hidden = showRegister;
  registerForm.hidden = !showRegister;
  showLoginButton.classList.toggle('active', !showRegister);
  showRegisterButton.classList.toggle('active', showRegister);
  showLoginButton.setAttribute('aria-pressed', String(!showRegister));
  showRegisterButton.setAttribute('aria-pressed', String(showRegister));
  loginError.textContent = '';
  registerError.textContent = '';
  (showRegister ? registerForm : loginForm).elements.username.focus();
}

function startUserSession(username) {
  isUserAuthenticated = true;
  isOwnerPreview = false;
  currentUsername = username;
  localStorage.setItem(userSessionKey, normalizeUsername(username));
  authGate.hidden = true;
  logoutButton.hidden = false;
  ordersButton.hidden = false;
  ordersButton.hidden = false;
  ownerOpenedFromAuth = false;
  setActiveMode('user');
  showToast(`Bienvenida, ${username}`);
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function productMarkup(id, product) {
  const categoryNames = { dresses: 'Vestidos', sets: 'Conjuntos', outerwear: 'Abrigos' };
  const categoryName = categoryNames[product.category] || product.category;
  const images = product.images?.length ? product.images : [product.image];
  const sizes = product.sizes?.length ? product.sizes : defaultSizes;
  const stock = Number.isFinite(Number(product.stock)) ? Math.max(0, Math.floor(Number(product.stock))) : defaultStock;
  const imageList = images.filter(Boolean).map((image) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" />`).join('');
  const sizeOptions = sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join('');
  const stockLabel = stock === 0 ? 'Agotado' : stock === 1 ? 'Queda 1 unidad' : `Quedan ${stock} unidades`;
  return `<article class="product-card" data-product-id="${escapeHtml(id)}" data-category="${escapeHtml(product.category)}" data-stock="${stock}">
    <div class="product-media">
      <div class="product-image-list">${imageList}</div>
      <span class="badge">Nuevo</span>
      <div class="product-actions">
        <button type="button" aria-label="Ver producto"><i class="fa-regular fa-eye"></i></button>
        <button type="button" aria-label="Favorito"><i class="fa-regular fa-heart"></i></button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-topline"><span class="tag">${escapeHtml(categoryName)}</span><span class="price">${escapeHtml(product.price)}</span></div>
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description)}</p>
      <p class="product-stock${stock === 0 ? ' out-of-stock' : ''}">${stockLabel}</p>
      <label class="product-size-field"><span>Talla</span><select class="product-size-select" aria-label="Talla para ${escapeHtml(product.name)}" required><option value="">Elige talla</option>${sizeOptions}</select></label>
      <div class="product-bottom"><span class="stars">★★★★★</span><button class="add-cart-btn" type="button" data-product="${escapeHtml(product.name)}" ${stock === 0 ? 'disabled' : ''}>Añadir</button></div>
    </div>
  </article>`;
}

function updateLightboxImage() {
  const image = lightboxImages[lightboxIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = `${lightboxProductName}, imagen ${lightboxIndex + 1}`;
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
  lightboxPrevious.hidden = lightboxImages.length < 2;
  lightboxNext.hidden = lightboxImages.length < 2;
}

function openProductLightbox(gallery, index, productName, trigger) {
  lightboxImages = [...gallery.querySelectorAll('img')].map((image) => ({ src: image.src, alt: image.alt }));
  if (lightboxImages.length === 0) return;

  lightboxIndex = index;
  lightboxProductName = productName;
  lastLightboxTrigger = trigger;
  const productCard = gallery.closest('.product-card');
  lightboxProductCard = productCard;
  const stock = Number(productCard.dataset.stock || 0);
  lightboxTitle.textContent = productName;
  lightboxPrice.textContent = productCard.querySelector('.price').textContent;
  lightboxDescription.textContent = productCard.querySelector('.product-info > p').textContent;
  lightboxStock.textContent = stock === 0 ? 'Agotado' : stock === 1 ? 'Queda 1 unidad' : `Quedan ${stock} unidades`;
  lightboxStock.classList.toggle('out-of-stock', stock === 0);
  lightboxSize.innerHTML = '<option value="">Elige talla</option>' + [...productCard.querySelector('.product-size-select').options]
    .filter((option) => option.value)
    .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.textContent)}</option>`)
    .join('');
  lightboxAdd.disabled = stock === 0;
  lightboxAdd.dataset.productId = productCard.dataset.productId;
  updateLightboxImage();
  productLightbox.hidden = false;
  productLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

function closeProductLightbox() {
  productLightbox.hidden = true;
  productLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lastLightboxTrigger?.focus();
}

function moveLightboxImage(direction) {
  lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
  updateLightboxImage();
}

function applyProductFilters() {
  productCards.forEach((card) => {
    const searchableText = `${card.querySelector('h3').textContent} ${card.querySelector('.product-info p').textContent}`.toLowerCase();
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = searchableText.includes(searchQuery);
    card.classList.toggle('hidden', !matchesCategory || !matchesSearch);
  });
}

function bindStoreInteractions() {
  productCards = document.querySelectorAll('.product-card');
  filterButtons = document.querySelectorAll('.filter-option');

  document.querySelectorAll('.add-cart-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const sizeSelect = card.querySelector('.product-size-select');
      if (!sizeSelect.value) {
        sizeSelect.focus();
        showToast('Elige una talla antes de añadir el producto');
        return;
      }

      addToCart(card, sizeSelect.value);
    });
  });

  document.querySelectorAll('.product-image-list').forEach((gallery) => {
    gallery.querySelectorAll('img').forEach((image, index) => {
      image.addEventListener('click', () => {
        gallery.querySelectorAll('img').forEach((item) => item.classList.remove('selected'));
        image.classList.add('selected');
        openProductLightbox(gallery, index, gallery.closest('.product-card').querySelector('h3').textContent, image);
      });
      if (index === 0) image.classList.add('selected');
    });
  });

  document.querySelectorAll('.product-actions button').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const productName = card.querySelector('h3').textContent;

      if (button.getAttribute('aria-label') === 'Favorito') {
        button.classList.toggle('active');
        button.innerHTML = button.classList.contains('active')
          ? '<i class="fa-solid fa-heart"></i>'
          : '<i class="fa-regular fa-heart"></i>';
        showToast(button.classList.contains('active') ? `${productName} guardado en favoritos` : `${productName} quitado de favoritos`);
        return;
      }

      openProductLightbox(card.querySelector('.product-image-list'), 0, productName, button);
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      applyProductFilters();
    });
  });

  applyProductFilters();
}

function renderProducts(store) {
  productGrid.innerHTML = Object.entries(store.products)
    .map(([id, product]) => productMarkup(id, product))
    .join('');
  bindStoreInteractions();
}

function addToCart(productCard, size) {
  if (!size) {
    showToast('Elige una talla antes de añadir el producto');
    return false;
  }

  const productId = productCard.dataset.productId;
  const productName = productCard.querySelector('h3').textContent;
  const stock = Number(productCard.dataset.stock || 0);
  const alreadyInCart = cartItems.filter((item) => item.productId === productId).length;
  if (alreadyInCart >= stock) {
    showToast('No quedan más unidades disponibles para añadir');
    return false;
  }

  cartItems.push({ productId, name: productName, size });
  updateCart();
  showToast(`${productName} · Talla ${size} añadido al carrito`);
  return true;
}

lightboxAdd.addEventListener('click', () => {
  if (addToCart(lightboxProductCard, lightboxSize.value)) closeProductLightbox();
});

function getOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function getOrderTimestamp(order) {
  if (Number.isFinite(order.createdAt)) return order.createdAt;
  if (typeof order.createdAt !== 'string') return null;

  const localDate = order.createdAt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (localDate) {
    return new Date(
      Number(localDate[3]),
      Number(localDate[2]) - 1,
      Number(localDate[1]),
      Number(localDate[4] || 0),
      Number(localDate[5] || 0),
      Number(localDate[6] || 0),
    ).getTime();
  }

  const timestamp = Date.parse(order.createdAt);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function canCancelOrder(order) {
  const createdAt = getOrderTimestamp(order);
  const isUndelivered = order.status === 'Pendiente' || order.status === 'Enviado';
  return createdAt !== null
    && Date.now() >= createdAt
    && Date.now() - createdAt <= orderCancellationWindow
    && isUndelivered;
}

function formatOrderDate(order) {
  const timestamp = getOrderTimestamp(order);
  return timestamp === null ? 'Fecha no disponible' : new Date(timestamp).toLocaleString('es');
}

function renderUserOrders() {
  const username = normalizeUsername(currentUsername);
  const userOrders = getOrders().filter((order) => normalizeUsername(order.username || '') === username);

  if (userOrders.length === 0) {
    orderHistoryList.innerHTML = '<p class="order-history-empty">Todavía no has realizado pedidos.</p>';
    return;
  }

  const formatOrderItem = (item) => typeof item === 'string' ? item : `${item.name} · Talla ${item.size}`;
  const paymentMethodName = (method) => method === 'transferencia' ? 'Transferencia' : method === 'efectivo' ? 'Efectivo' : 'No indicado';
  orderHistoryList.innerHTML = userOrders.map((order) => `
    <article class="order-history-card">
      <div class="order-history-heading">
        <strong>Pedido #${escapeHtml(order.id)}</strong>
        <span class="order-history-status">${escapeHtml(order.status)}</span>
      </div>
      <p>${escapeHtml(formatOrderDate(order))}</p>
      <p>Entrega: ${escapeHtml(order.recipient)} · ${escapeHtml(order.phone)}</p>
      <p>Ubicación: ${escapeHtml(order.location || order.address || '')}</p>
      <p>Pago: ${paymentMethodName(order.paymentMethod)}</p>
      <ul>${order.items.map((item) => `<li>${escapeHtml(formatOrderItem(item))}</li>`).join('')}</ul>
      ${order.deliveryCode ? `<div class="history-delivery-code"><span>Código de entrega</span><code>${escapeHtml(order.deliveryCode)}</code></div>` : '<p>Código no disponible para este pedido.</p>'}
      ${canCancelOrder(order) ? `<button class="cancel-order-button" type="button" data-cancel-order="${escapeHtml(order.id)}">Cancelar pedido</button><p>Disponible hasta ${escapeHtml(new Date(getOrderTimestamp(order) + orderCancellationWindow).toLocaleString('es'))}.</p>` : ''}
    </article>
  `).join('');

  orderHistoryList.querySelectorAll('[data-cancel-order]').forEach((button) => {
    button.addEventListener('click', () => cancelUserOrder(button.dataset.cancelOrder));
  });
}

function cancelUserOrder(orderId) {
  const orders = getOrders();
  const order = orders.find((item) => String(item.id) === orderId
    && normalizeUsername(item.username || '') === normalizeUsername(currentUsername));
  if (!order || !canCancelOrder(order)) {
    renderUserOrders();
    showToast('Este pedido ya no se puede cancelar');
    return;
  }

  const store = getStore();
  order.items.forEach((item) => {
    if (typeof item !== 'string' && store.products[item.productId]) {
      store.products[item.productId].stock += 1;
    }
  });
  order.status = 'Cancelado';
  order.cancelledAt = Date.now();

  try {
    localStorage.setItem(storeKey, JSON.stringify(store));
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  } catch {
    showToast('No se pudo cancelar el pedido en este navegador');
    return;
  }

  applyStore(store);
  renderUserOrders();
  showToast('Pedido cancelado y existencias restauradas');
}

function renderAdminOrders() {
  const orders = getOrders();
  if (orders.length === 0) {
    adminOrders.innerHTML = '<p class="admin-orders-empty">Todavía no hay pedidos.</p>';
    return;
  }

  const formatOrderItem = (item) => typeof item === 'string' ? item : `${item.name} · Talla ${item.size}`;
  const paymentMethodName = (method) => method === 'transferencia' ? 'Transferencia' : method === 'efectivo' ? 'Efectivo' : 'No indicado';
  adminOrders.innerHTML = orders.map((order) => `
    <article class="order-entry">
      <strong>Pedido #${escapeHtml(order.id)} · ${escapeHtml(order.status)}</strong>
      <span>Fecha: ${escapeHtml(formatOrderDate(order))}</span>
      <span>Cuenta: ${escapeHtml(order.username)}</span>
      <span>Recibe: ${escapeHtml(order.recipient)} · ${escapeHtml(order.phone)}</span>
      <span>Ubicación: ${escapeHtml(order.location || order.address || '')}</span>
      <span>Pago: ${paymentMethodName(order.paymentMethod)}</span>
      <ul>${order.items.map((item) => `<li>${escapeHtml(formatOrderItem(item))}</li>`).join('')}</ul>
      ${order.status === 'Pendiente' ? `<button class="order-status-button" type="button" data-order-sent="${escapeHtml(order.id)}">Marcar enviado</button>` : ''}
      ${order.status === 'Enviado' && order.deliveryCodeSalt && order.deliveryCodeHash ? `<div class="delivery-code-form" data-delivery-order="${escapeHtml(order.id)}"><label>Código de entrega<input name="code" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" /></label><button class="order-status-button" type="button">Verificar entrega</button><p class="delivery-code-error" role="alert"></p></div>` : ''}
    </article>
  `).join('');

  adminOrders.querySelectorAll('[data-order-sent]').forEach((button) => {
    button.addEventListener('click', () => {
      const order = getOrders().find((item) => String(item.id) === button.dataset.orderSent);
      if (!order) return;
      order.status = 'Enviado';
      localStorage.setItem(ordersKey, JSON.stringify(getOrders().map((item) => (
        String(item.id) === String(order.id) ? order : item
      ))));
      renderAdminOrders();
      showToast('Pedido marcado como enviado');
    });
  });

  adminOrders.querySelectorAll('.delivery-code-form').forEach((form) => {
    form.querySelector('button').addEventListener('click', async () => {
      const order = getOrders().find((item) => String(item.id) === form.dataset.deliveryOrder);
      if (!order) return;

      const codeInput = form.querySelector('[name="code"]');
      const code = codeInput.value.trim();
      if (!/^\d{6}$/.test(code)) {
        codeInput.reportValidity();
        return;
      }

      const codeHash = await hashPassword(code, order.deliveryCodeSalt);
      if (codeHash !== order.deliveryCodeHash) {
        form.querySelector('.delivery-code-error').textContent = 'Código incorrecto. Verifica e intenta de nuevo.';
        return;
      }

      order.status = 'Entregado';
      localStorage.setItem(ordersKey, JSON.stringify(getOrders().map((item) => (
        String(item.id) === String(order.id) ? order : item
      ))));
      renderAdminOrders();
      showToast('Código correcto. Pedido marcado como entregado.');
    });
  });
}

function closeShippingForm() {
  shippingModal.hidden = true;
  shippingModal.setAttribute('aria-hidden', 'true');
}

function closeOrderHistoryPanel() {
  orderHistoryModal.hidden = true;
  orderHistoryModal.setAttribute('aria-hidden', 'true');
}

ordersButton.addEventListener('click', () => {
  if (!isUserAuthenticated || !currentUsername) return;
  renderUserOrders();
  orderHistoryModal.hidden = false;
  orderHistoryModal.setAttribute('aria-hidden', 'false');
  closeOrderHistory.focus();
});

closeOrderHistory.addEventListener('click', closeOrderHistoryPanel);
orderHistoryModal.addEventListener('click', (event) => {
  if (event.target === orderHistoryModal) closeOrderHistoryPanel();
});
document.addEventListener('keydown', (event) => {
  if (!orderHistoryModal.hidden && event.key === 'Escape') closeOrderHistoryPanel();
});

checkoutButton.addEventListener('click', () => {
  if (cartItems.length < minimumShippingItems) return;
  prefillShippingForm();
  shippingOrderCount.textContent = `${cartItems.length} productos en este pedido.`;
  shippingModal.hidden = false;
  shippingModal.setAttribute('aria-hidden', 'false');
  shippingForm.elements.recipient.focus();
});

lightboxPrevious.addEventListener('click', () => moveLightboxImage(-1));
lightboxNext.addEventListener('click', () => moveLightboxImage(1));
lightboxClose.addEventListener('click', closeProductLightbox);
productLightbox.addEventListener('click', (event) => {
  if (event.target === productLightbox) closeProductLightbox();
});
document.addEventListener('keydown', (event) => {
  if (productLightbox.hidden) return;
  if (event.key === 'Escape') closeProductLightbox();
  if (event.key === 'ArrowLeft') moveLightboxImage(-1);
  if (event.key === 'ArrowRight') moveLightboxImage(1);
});

closeShipping.addEventListener('click', closeShippingForm);
shippingModal.addEventListener('click', (event) => {
  if (event.target === shippingModal) closeShippingForm();
});
closeOrderCode.addEventListener('click', () => {
  orderCodeModal.hidden = true;
  orderCodeModal.setAttribute('aria-hidden', 'true');
});

shippingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (cartItems.length < minimumShippingItems) {
    closeShippingForm();
    updateCart();
    return;
  }

  const store = getStore();
  const requestedStock = new Map();
  cartItems.forEach((item) => requestedStock.set(item.productId, (requestedStock.get(item.productId) || 0) + 1));
  for (const [productId, quantity] of requestedStock) {
    const product = store.products[productId];
    if (!product || product.stock < quantity) {
      shippingOrderCount.textContent = `No hay suficientes unidades de ${product?.name || 'un producto'} disponibles.`;
      return;
    }
  }

  const orders = getOrders();
  const customerDetails = {
    recipient: shippingForm.elements.recipient.value.trim(),
    phone: shippingForm.elements.phone.value.trim(),
    location: shippingForm.elements.location.value.trim(),
    paymentMethod: shippingForm.elements.paymentMethod.value,
  };
  const order = {
    id: String(Date.now()),
    username: currentUsername,
    ...customerDetails,
    items: cartItems.map((item) => ({ ...item })),
    createdAt: Date.now(),
    status: 'Pendiente',
  };

  const previousStore = localStorage.getItem(storeKey);
  const previousOrders = localStorage.getItem(ordersKey);
  const previousCustomerDetails = localStorage.getItem(customerDetailsKey);
  let deliveryCode;
  try {
    const deliveryCodeSalt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    deliveryCode = generateDeliveryCode();
    order.deliveryCode = deliveryCode;
    order.deliveryCodeSalt = deliveryCodeSalt;
    order.deliveryCodeHash = await hashPassword(deliveryCode, deliveryCodeSalt);
    requestedStock.forEach((quantity, productId) => {
      store.products[productId].stock -= quantity;
    });
    localStorage.setItem(storeKey, JSON.stringify(store));
    localStorage.setItem(ordersKey, JSON.stringify([order, ...orders]));
    saveCustomerDetails(customerDetails);
  } catch {
    if (previousStore === null) localStorage.removeItem(storeKey);
    else localStorage.setItem(storeKey, previousStore);
    if (previousOrders === null) localStorage.removeItem(ordersKey);
    else localStorage.setItem(ordersKey, previousOrders);
    if (previousCustomerDetails === null) localStorage.removeItem(customerDetailsKey);
    else localStorage.setItem(customerDetailsKey, previousCustomerDetails);
    shippingOrderCount.textContent = 'No se pudo guardar el pedido en este navegador.';
    return;
  }

  applyStore(store);
  cartItems = [];
  updateCart();
  shippingForm.reset();
  closeShippingForm();
  deliveryCodeDisplay.textContent = deliveryCode;
  orderCodeModal.hidden = false;
  orderCodeModal.setAttribute('aria-hidden', 'false');
});

newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  showToast('Gracias por suscribirte');
  newsletterForm.reset();
});

updateCart();

searchButton.addEventListener('click', () => {
  searchBar.hidden = !searchBar.hidden;
  if (!searchBar.hidden) productSearch.focus();
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchQuery = productSearch.value.trim().toLowerCase();
  applyProductFilters();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  showToast(searchQuery ? `Resultados para: ${productSearch.value.trim()}` : 'Mostrando todos los productos');
});

cartTrigger.addEventListener('click', () => {
  cartBox.classList.toggle('cart-open');
});

document.addEventListener('click', (event) => {
  if (!cartBox.contains(event.target)) cartBox.classList.remove('cart-open');
});

function getStore() {
  try {
    const savedStore = JSON.parse(localStorage.getItem(storeKey));
    if (!savedStore) return cloneStore(defaultStore);

    const products = Object.fromEntries(Object.entries(savedStore.products || {}).map(([id, product]) => [id, {
      ...product,
      category: product.category || 'dresses',
      images: product.images?.length ? product.images : [product.image],
      sizes: Array.isArray(product.sizes) && product.sizes.length ? product.sizes : [...defaultSizes],
      stock: Number.isFinite(Number(product.stock)) ? Math.max(0, Math.floor(Number(product.stock))) : defaultStock,
    }]));

    const benefits = Object.fromEntries(Object.entries(defaultStore.benefits).map(([key, defaults]) => [
      key,
      { ...defaults, ...(savedStore.benefits?.[key] || {}) },
    ]));

    return { ...cloneStore(defaultStore), ...savedStore, benefits, products };
  } catch {
    return cloneStore(defaultStore);
  }
}

function applyStore(store) {
  cartItems = cartItems.map((item) => {
    const updatedProduct = store.products[item.productId];
    return updatedProduct ? { ...item, name: updatedProduct.name } : item;
  });
  document.querySelectorAll('.brand-name').forEach((element) => {
    element.textContent = store.storeName;
  });
  document.querySelectorAll('.brand-mark').forEach((mark) => {
    const fallback = mark.querySelector('span');
    const image = mark.querySelector('img');
    image.hidden = !store.storeLogo;
    fallback.hidden = Boolean(store.storeLogo);
    mark.classList.toggle('has-image', Boolean(store.storeLogo));
    image.alt = store.storeLogo ? `${store.storeName} logo` : '';
    if (store.storeLogo) image.src = store.storeLogo;
    else image.removeAttribute('src');
  });
  document.getElementById('hero-eyebrow').textContent = store.heroEyebrow;
  document.getElementById('hero-title').textContent = store.heroTitle;
  document.getElementById('hero-text').textContent = store.heroText;
  Object.entries(store.benefits || defaultStore.benefits).forEach(([key, benefit]) => {
    const item = document.querySelector(`[data-benefit="${key}"]`);
    if (!item) return;
    item.querySelector('h3').textContent = benefit.title;
    item.querySelector('p').textContent = benefit.detail;
  });

  renderProducts(store);
  updateCart();
}

function validateProductImages(fieldset) {
  const imageField = fieldset.querySelector('[name$="-images"]');
  const fileInput = fieldset.querySelector('[name$="-files"]');
  const imageCount = imageField.value.split(/\r?\n/).map((image) => image.trim()).filter(Boolean).length + fileInput.files.length;
  const message = imageCount > 15
    ? 'Cada producto admite un máximo de 15 imágenes.'
    : imageCount === 0
      ? 'Agrega al menos una imagen.'
      : '';

  imageField.setCustomValidity(message);
  fileInput.setCustomValidity(message);
  fieldset.querySelector('.image-limit-error').textContent = message || 'Máximo 15 imágenes entre enlaces y archivos.';
  return !message;
}

function buildAdminProducts(store) {
  adminProducts.innerHTML = Object.entries(store.products).map(([id, product]) => `
    <fieldset class="admin-product" data-product-id="${id}">
      <legend>${product.name}</legend>
      <button class="remove-product" type="button" data-remove-product="${id}" aria-label="Eliminar ${product.name}"><i class="fa-solid fa-trash"></i></button>
      <label>Nombre<input name="${id}-name" type="text" value="${product.name}" required /></label>
      <label>Precio<input name="${id}-price" type="text" value="${product.price}" required /></label>
      <label>Existencias<input name="${id}-stock" type="number" min="0" step="1" value="${Number.isFinite(Number(product.stock)) ? Math.max(0, Math.floor(Number(product.stock))) : defaultStock}" required /></label>
      <label>Categoría<select name="${id}-category"><option value="dresses" ${product.category === 'dresses' ? 'selected' : ''}>Vestidos</option><option value="sets" ${product.category === 'sets' ? 'selected' : ''}>Conjuntos</option><option value="outerwear" ${product.category === 'outerwear' ? 'selected' : ''}>Abrigos</option></select></label>
      <label>Tallas disponibles (separadas por comas)<input name="${id}-sizes" type="text" value="${(product.sizes || defaultSizes).join(', ')}" placeholder="XS, S, M, L, XL" required /></label>
      <label>Imágenes (una URL por línea)<textarea name="${id}-images" rows="3">${(product.images || [product.image]).join('\n')}</textarea><small class="image-limit-error"></small></label>
      <label>Subir imágenes<input name="${id}-files" type="file" accept="image/*" multiple /></label>
      <label class="field-full">Descripción<textarea name="${id}-description" rows="2" required>${product.description}</textarea></label>
    </fieldset>
  `).join('');

  adminProducts.querySelectorAll('.admin-product').forEach((fieldset) => {
    const imageField = fieldset.querySelector('[name$="-images"]');
    const fileInput = fieldset.querySelector('[name$="-files"]');
    imageField.addEventListener('input', () => validateProductImages(fieldset));
    fileInput.addEventListener('change', () => validateProductImages(fieldset));
    validateProductImages(fieldset);
  });

  adminProducts.querySelectorAll('[data-remove-product]').forEach((button) => {
    button.addEventListener('click', () => button.closest('.admin-product').remove());
  });
}

function openAdmin() {
  const store = getStore();
  adminForm.storeName.value = store.storeName;
  adminForm.elements.storeLogoFile.value = '';
  updateAdminLogoPreview(store.storeLogo);
  adminForm.heroEyebrow.value = store.heroEyebrow;
  adminForm.heroTitle.value = store.heroTitle;
  adminForm.heroText.value = store.heroText;
  Object.entries(store.benefits || defaultStore.benefits).forEach(([key, benefit]) => {
    adminForm.elements[`${key}Title`].value = benefit.title;
    adminForm.elements[`${key}Detail`].value = benefit.detail;
  });
  buildAdminProducts(store);
  renderAdminOrders();
  adminAccessForm.hidden = false;
  adminForm.hidden = true;
  ownerPin.value = '';
  adminAccessError.textContent = '';
  adminModal.classList.add('open');
  adminModal.setAttribute('aria-hidden', 'false');
  ownerPin.focus();
}

function updateAdminLogoPreview(logo) {
  const hasLogo = Boolean(logo);
  adminLogoPreview.hidden = !hasLogo;
  if (hasLogo) adminLogoPreview.src = logo;
  else adminLogoPreview.removeAttribute('src');
}

function setActiveMode(mode) {
  const isOwner = mode === 'owner';
  userModeButton.classList.toggle('active', !isOwner);
  ownerAccess.classList.toggle('active', isOwner);
  userModeButton.setAttribute('aria-pressed', String(!isOwner));
  ownerAccess.setAttribute('aria-pressed', String(isOwner));
  document.body.classList.toggle('owner-mode', isOwner);
  adminModal.classList.toggle('owner-dashboard', isOwner);
  ownerAccess.innerHTML = isOwnerPreview
    ? '<i class="fa-solid fa-arrow-left"></i> Volver al panel'
    : '<i class="fa-solid fa-user-lock"></i> Dueña';
}

function closeAdminPanel() {
  adminModal.classList.remove('open');
  adminModal.setAttribute('aria-hidden', 'true');
  adminAccessForm.hidden = false;
  adminForm.hidden = true;
  setActiveMode('user');
  if (ownerOpenedFromAuth && !isUserAuthenticated) {
    authGate.hidden = false;
    selectAuthForm('login');
  }
  ownerOpenedFromAuth = false;
}

showLoginButton.addEventListener('click', () => selectAuthForm('login'));
showRegisterButton.addEventListener('click', () => selectAuthForm('register'));

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = normalizeUsername(loginForm.elements.username.value);
  const account = getAccounts()[username];

  if (!account) {
    loginError.textContent = 'Nombre de usuario o contraseña incorrectos.';
    return;
  }

  try {
    const passwordHash = await hashPassword(loginForm.elements.password.value, account.salt);
    if (passwordHash !== account.passwordHash) {
      loginError.textContent = 'Nombre de usuario o contraseña incorrectos.';
      return;
    }

    loginForm.reset();
    startUserSession(account.username);
  } catch {
    loginError.textContent = 'No se pudo validar la contraseña en este navegador.';
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  registerError.textContent = '';
  const username = registerForm.elements.username.value.trim();
  const usernameKey = normalizeUsername(username);
  const password = registerForm.elements.password.value;

  if (usernameKey.length < 3) {
    registerError.textContent = 'El nombre de usuario debe tener al menos 3 caracteres.';
    return;
  }
  const accounts = getAccounts();
  if (accounts[usernameKey]) {
    registerError.textContent = 'Este usuario ya existe prueba otro';
    return;
  }
  if (password !== registerForm.elements.confirmPassword.value) {
    registerError.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  try {
    const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await hashPassword(password, salt);
    accounts[usernameKey] = { username, salt, passwordHash };
    localStorage.setItem(usersKey, JSON.stringify(accounts));
    registerForm.reset();
    startUserSession(username);
  } catch {
    registerError.textContent = 'No se pudo crear la cuenta en este navegador.';
  }
});

registerForm.elements.username.addEventListener('input', () => {
  if (registerError.textContent === 'Este usuario ya existe prueba otro') {
    registerError.textContent = '';
  }
});

authOwnerAccess.addEventListener('click', () => {
  ownerOpenedFromAuth = true;
  authGate.hidden = true;
  openAdmin();
});

logoutButton.addEventListener('click', () => {
  isUserAuthenticated = false;
  isOwnerPreview = false;
  currentUsername = '';
  localStorage.removeItem(userSessionKey);
  logoutButton.hidden = true;
  ordersButton.hidden = true;
  closeOrderHistoryPanel();
  cartItems = [];
  updateCart();
  loginForm.reset();
  registerForm.reset();
  authGate.hidden = false;
  selectAuthForm('login');
});

previewStoreButton.addEventListener('click', () => {
  previewAuthForm.reset();
  previewAuthError.textContent = '';
  previewAuthModal.hidden = false;
  previewAuthModal.setAttribute('aria-hidden', 'false');
  previewAuthForm.elements.password.focus();
});

function closePreviewAuth() {
  previewAuthModal.hidden = true;
  previewAuthModal.setAttribute('aria-hidden', 'true');
  previewStoreButton.focus();
}

cancelPreviewButton.addEventListener('click', closePreviewAuth);
previewAuthModal.addEventListener('click', (event) => {
  if (event.target === previewAuthModal) closePreviewAuth();
});
previewAuthForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (previewAuthForm.elements.password.value !== ownerPassword) {
    previewAuthError.textContent = 'Contraseña incorrecta';
    previewAuthForm.elements.password.select();
    return;
  }

  isOwnerPreview = true;
  ownerOpenedFromAuth = false;
  closePreviewAuth();
  closeAdminPanel();
  authGate.hidden = true;
  setActiveMode('user');
});

document.addEventListener('keydown', (event) => {
  if (!previewAuthModal.hidden && event.key === 'Escape') closePreviewAuth();
});

ownerAccess.addEventListener('click', () => {
  if (!isOwnerPreview) {
    openAdmin();
    return;
  }

  isOwnerPreview = false;
  openAdmin();
  adminAccessForm.hidden = true;
  adminForm.hidden = false;
  setActiveMode('owner');
  adminForm.storeName.focus();
});
userModeButton.addEventListener('click', () => {
  closeAdminPanel();
  if (!isUserAuthenticated && !isOwnerPreview) {
    authGate.hidden = false;
    selectAuthForm('login');
  }
});
adminAccessForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (ownerPin.value !== ownerPassword) {
    adminAccessError.textContent = 'PIN incorrecto';
    ownerPin.select();
    return;
  }

  adminAccessForm.hidden = true;
  adminForm.hidden = false;
  setActiveMode('owner');
  adminForm.storeName.focus();
});
adminForm.elements.storeLogoFile.addEventListener('change', async (event) => {
  const [file] = event.currentTarget.files;
  if (file) updateAdminLogoPreview(await readImageFile(file));
});
closeAdmin.addEventListener('click', closeAdminPanel);
adminModal.addEventListener('click', (event) => {
  if (event.target === adminModal) closeAdminPanel();
});

adminForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const store = getStore();
  store.storeName = adminForm.storeName.value.trim();
  const logoFile = adminForm.elements.storeLogoFile.files[0];
  if (logoFile) store.storeLogo = await readImageFile(logoFile);
  store.heroEyebrow = adminForm.heroEyebrow.value.trim();
  store.heroTitle = adminForm.heroTitle.value.trim();
  store.heroText = adminForm.heroText.value.trim();
  store.benefits = Object.fromEntries(Object.keys(defaultStore.benefits).map((key) => [key, {
    title: adminForm.elements[`${key}Title`].value.trim(),
    detail: adminForm.elements[`${key}Detail`].value.trim(),
  }]));

  const products = {};
  const productFields = [...adminProducts.querySelectorAll('.admin-product')];
  for (const fieldset of productFields) {
    const id = fieldset.dataset.productId;
    const sizes = [...new Set(adminForm.elements[`${id}-sizes`].value.split(',').map((size) => size.trim()).filter(Boolean))];
    if (sizes.length === 0) {
      showToast('Agrega al menos una talla disponible');
      adminForm.elements[`${id}-sizes`].focus();
      return;
    }
    if (!validateProductImages(fieldset)) {
      fieldset.querySelector('[name$="-images"]').focus();
      return;
    }
  }

  productFields.forEach((fieldset) => {
    const id = fieldset.dataset.productId;
    products[id] = {
      category: adminForm[`${id}-category`].value,
      name: adminForm[`${id}-name`].value.trim(),
      price: adminForm[`${id}-price`].value.trim(),
      stock: Number(adminForm.elements[`${id}-stock`].value),
      images: adminForm[`${id}-images`].value.split('\n').map((image) => image.trim()).filter(Boolean),
      sizes: [...new Set(adminForm.elements[`${id}-sizes`].value.split(',').map((size) => size.trim()).filter(Boolean))],
      description: adminForm[`${id}-description`].value.trim(),
    };
    products[id].image = products[id].images[0];
  });

  await Promise.all(productFields.map(async (fieldset) => {
    const id = fieldset.dataset.productId;
    const files = [...fieldset.querySelector(`[name="${id}-files"]`).files];
    const uploadedImages = await Promise.all(files.map(readImageFile));
    products[id].images.push(...uploadedImages);
  }));
  store.products = products;

  localStorage.setItem(storeKey, JSON.stringify(store));
  applyStore(store);
  closeAdminPanel();
  showToast('Cambios guardados en esta tienda');
});

resetStore.addEventListener('click', () => {
  localStorage.removeItem(storeKey);
  const originalStore = cloneStore(defaultStore);
  applyStore(originalStore);
  buildAdminProducts(originalStore);
  adminForm.storeName.value = originalStore.storeName;
  adminForm.elements.storeLogoFile.value = '';
  updateAdminLogoPreview(originalStore.storeLogo);
  adminForm.heroEyebrow.value = originalStore.heroEyebrow;
  adminForm.heroTitle.value = originalStore.heroTitle;
  adminForm.heroText.value = originalStore.heroText;
  Object.entries(originalStore.benefits).forEach(([key, benefit]) => {
    adminForm.elements[`${key}Title`].value = benefit.title;
    adminForm.elements[`${key}Detail`].value = benefit.detail;
  });
  showToast('Tienda restaurada');
});

addProductButton.addEventListener('click', () => {
  const id = `producto-${Date.now()}`;
  const product = {
    category: 'dresses',
    name: 'Nuevo producto',
    price: '$0',
    stock: defaultStock,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    sizes: [...defaultSizes],
    description: 'Describe aquí tu nuevo producto.',
  };
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'admin-product';
  fieldset.dataset.productId = id;
  fieldset.innerHTML = `<legend>${product.name}</legend><button class="remove-product" type="button" aria-label="Eliminar producto"><i class="fa-solid fa-trash"></i></button><label>Nombre<input name="${id}-name" type="text" value="${product.name}" required /></label><label>Precio<input name="${id}-price" type="text" value="${product.price}" required /></label><label>Existencias<input name="${id}-stock" type="number" min="0" step="1" value="${product.stock}" required /></label><label>Categoría<select name="${id}-category"><option value="dresses">Vestidos</option><option value="sets">Conjuntos</option><option value="outerwear">Abrigos</option></select></label><label>Tallas disponibles (separadas por comas)<input name="${id}-sizes" type="text" value="${product.sizes.join(', ')}" required /></label><label>Imágenes (una URL por línea)<textarea name="${id}-images" rows="3">${product.image}</textarea><small class="image-limit-error"></small></label><label>Subir imágenes<input name="${id}-files" type="file" accept="image/*" multiple /></label><label class="field-full">Descripción<textarea name="${id}-description" rows="2" required>${product.description}</textarea></label>`;
  fieldset.querySelector('.remove-product').addEventListener('click', () => fieldset.remove());
  const imageField = fieldset.querySelector('[name$="-images"]');
  const fileInput = fieldset.querySelector('[name$="-files"]');
  imageField.addEventListener('input', () => validateProductImages(fieldset));
  fileInput.addEventListener('change', () => validateProductImages(fieldset));
  validateProductImages(fieldset);
  adminProducts.appendChild(fieldset);
});

applyStore(getStore());

const savedUsername = localStorage.getItem(userSessionKey);
const savedAccount = savedUsername ? getAccounts()[savedUsername] : null;
if (savedAccount) {
  startUserSession(savedAccount.username);
} else if (savedUsername) {
  localStorage.removeItem(userSessionKey);
}
