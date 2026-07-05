/* ─────────────────────────────────────────────────────────────────────────
   PASSIONIS — cart.js
   Single shared cart module for every product page. The cart lives on the
   server (per logged-in user, via /api/cart) instead of localStorage, so it
   persists across devices and sessions.

   Cart line shape (as returned by the API):
   { id, productId, name, price, image, size, quantity }
   Product data for NEW lines is read from data-* attributes on the page's
   .add-to-cart button, so this one file works unmodified on every product.
───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var currentItems = [];
  var busy = false;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* All cart pages already sit behind the site's login gate, but the JWT
     cookie could still expire mid-session — treat a redirect response
     (requireAuth's default behaviour) as "please log in again". */
  async function apiCall(url, options) {
    options = options || {};
    options.redirect = 'manual';
    options.headers  = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});

    var res = await fetch(url, options);

    if (res.type === 'opaqueredirect' || res.status === 0) {
      window.location.href = '/login.html';
      throw new Error('Not authenticated.');
    }

    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || 'Cart request failed.');
    return data;
  }

  function updateBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    var total = currentItems.reduce(function (sum, l) { return sum + l.quantity; }, 0);
    badge.textContent = total;
  }

  function renderCart() {
    updateBadge();

    var container = document.getElementById('cart-items');
    if (!container) return;

    container.innerHTML = '';

    if (!currentItems.length) {
      var empty = document.createElement('p');
      empty.className = 'cart-line-empty';
      empty.textContent = 'Your cart is empty.';
      container.appendChild(empty);
      return;
    }

    currentItems.forEach(function (item) {
      var el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML =
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
        '<div>' +
          '<p>' + escapeHtml(item.name) + '</p>' +
          '<p>' + escapeHtml(item.price) + '</p>' +
          (item.size ? '<p>Size: ' + escapeHtml(item.size) + '</p>' : '') +
          '<div class="cart-line-actions">' +
            '<button type="button" class="cart-qty-btn" data-action="dec">−</button>' +
            '<span class="cart-line-qty">' + item.quantity + '</span>' +
            '<button type="button" class="cart-qty-btn" data-action="inc">+</button>' +
            '<button type="button" class="cart-line-remove" aria-label="Remove item">&times;</button>' +
          '</div>' +
        '</div>';

      el.querySelector('[data-action="inc"]').addEventListener('click', function (e) {
        e.stopPropagation();
        adjustQuantity(item, 1);
      });
      el.querySelector('[data-action="dec"]').addEventListener('click', function (e) {
        e.stopPropagation();
        adjustQuantity(item, -1);
      });
      el.querySelector('.cart-line-remove').addEventListener('click', function (e) {
        e.stopPropagation();
        removeLine(item);
      });

      container.appendChild(el);
    });

    var checkoutLink = document.createElement('a');
    checkoutLink.className = 'cart-checkout-link';
    checkoutLink.href = assetBase() + 'checkout.html';
    checkoutLink.textContent = 'Checkout →';
    container.appendChild(checkoutLink);
  }

  function assetBase() {
    return window.location.pathname.includes('/pages/') ? '' : 'pages/';
  }

  async function withBusyGuard(fn) {
    if (busy) return;
    busy = true;
    try {
      await fn();
    } catch (e) {
      console.error('[cart]', e.message);
      alert(e.message || 'Something went wrong with your cart. Please try again.');
    } finally {
      busy = false;
    }
  }

  function fetchCart() {
    return withBusyGuard(async function () {
      var data = await apiCall('/api/cart');
      currentItems = data.items;
      renderCart();
    });
  }

  function addToCart(product, size, qty) {
    return withBusyGuard(async function () {
      var data = await apiCall('/api/cart', {
        method: 'POST',
        body:   JSON.stringify({ productId: product.id, size: size, delta: qty || 1 }),
      });
      currentItems = data.items;
      renderCart();
    });
  }

  function adjustQuantity(item, delta) {
    return withBusyGuard(async function () {
      var data = await apiCall('/api/cart', {
        method: 'POST',
        body:   JSON.stringify({ productId: item.productId, size: item.size, delta: delta }),
      });
      currentItems = data.items;
      renderCart();
    });
  }

  function removeLine(item) {
    return withBusyGuard(async function () {
      var data = await apiCall('/api/cart/' + item.id, { method: 'DELETE' });
      currentItems = data.items;
      renderCart();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetchCart();

    /* ── Size selection (page-scoped — not persisted cross-product) ─── */
    var sizeOptions = document.querySelector('.size-options');
    var selectedSize = null;
    var sizeErrorEl  = null;

    if (sizeOptions) {
      sizeErrorEl = document.createElement('p');
      sizeErrorEl.className = 'size-error';
      sizeErrorEl.textContent = 'Please select a size to continue.';
      sizeErrorEl.style.cssText =
        'display:none;color:var(--c-accent);font-size:11px;letter-spacing:.06em;margin-top:8px;';
      sizeOptions.insertAdjacentElement('afterend', sizeErrorEl);

      sizeOptions.addEventListener('click', function (e) {
        if (e.target.tagName !== 'SPAN') return;
        sizeOptions.querySelectorAll('span').forEach(function (s) { s.classList.remove('selected'); });
        e.target.classList.add('selected');
        selectedSize = e.target.textContent.trim();
        if (sizeErrorEl) sizeErrorEl.style.display = 'none';
      });
    }

    function requireSize() {
      if (!sizeOptions || selectedSize) return true;
      if (sizeErrorEl) sizeErrorEl.style.display = 'block';
      sizeOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return false;
    }

    /* ── Add to cart ──────────────────────────────────────────────── */
    var addBtn = document.querySelector('.add-to-cart');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (!requireSize()) return;
        var product = {
          id:    addBtn.dataset.id,
          name:  addBtn.dataset.name,
          price: addBtn.dataset.price,
          image: addBtn.dataset.image,
        };
        addToCart(product, selectedSize, 1);
      });
    }
  });
})();
