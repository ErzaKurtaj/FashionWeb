document.addEventListener('DOMContentLoaded', function () {
  var linesEl   = document.getElementById('checkout-lines');
  var totalEl   = document.getElementById('checkout-total');
  var placeBtn  = document.getElementById('place-order-btn');
  var errorEl   = document.getElementById('checkout-error');

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = msg ? 'block' : 'none';
  }

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
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  function priceNumber(priceStr) {
    var m = /^(\d+(?:\.\d+)?)/.exec(priceStr || '');
    return m ? Number(m[1]) : 0;
  }

  async function loadCart() {
    try {
      var data = await apiCall('/api/cart');
      renderLines(data.items);
    } catch (e) {
      showError(e.message);
    }
  }

  function renderLines(items) {
    linesEl.innerHTML = '';

    if (!items.length) {
      linesEl.innerHTML =
        '<div class="checkout-empty"><p>Your cart is empty. ' +
        '<a href="clothes.html">Continue shopping</a>.</p></div>';
      totalEl.textContent = '0.00 EUR';
      placeBtn.disabled = true;
      return;
    }

    var total = 0;
    items.forEach(function (item) {
      var unit = priceNumber(item.price);
      var subtotal = unit * item.quantity;
      total += subtotal;

      var line = document.createElement('div');
      line.className = 'checkout-line';
      line.innerHTML =
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
        '<div class="checkout-line-info">' +
          '<p class="name">' + escapeHtml(item.name) + '</p>' +
          '<p>' + (item.size ? 'Size: ' + escapeHtml(item.size) + ' · ' : '') + 'Qty: ' + item.quantity + '</p>' +
        '</div>' +
        '<div class="checkout-line-subtotal">' + subtotal.toFixed(2) + ' EUR</div>';
      linesEl.appendChild(line);
    });

    totalEl.textContent = total.toFixed(2) + ' EUR';
    placeBtn.disabled = false;
  }

  placeBtn.addEventListener('click', async function () {
    showError('');
    placeBtn.disabled = true;
    placeBtn.textContent = 'Placing Order…';

    try {
      var data = await apiCall('/api/checkout', { method: 'POST' });
      window.location.href = 'orders.html?placed=' + data.order.id;
    } catch (e) {
      showError(e.message);
      placeBtn.disabled = false;
      placeBtn.textContent = 'Place Order';
    }
  });

  loadCart();
});
