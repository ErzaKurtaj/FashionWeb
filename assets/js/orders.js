document.addEventListener('DOMContentLoaded', function () {
  var listEl   = document.getElementById('orders-list');
  var bannerEl = document.getElementById('orders-placed-banner');

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var placedId = new URLSearchParams(window.location.search).get('placed');
  if (placedId) {
    bannerEl.textContent = 'Order #' + placedId + ' placed successfully — thank you for shopping with PASSIONIS.';
    bannerEl.style.display = 'block';
  }

  async function loadOrders() {
    try {
      var res = await fetch('/api/orders', { redirect: 'manual' });
      if (res.type === 'opaqueredirect' || res.status === 0) {
        window.location.href = '/login.html';
        return;
      }
      var data = await res.json();
      renderOrders(data.orders || []);
    } catch (e) {
      listEl.innerHTML = '<div class="orders-empty"><p>Could not load your orders. Please try again.</p></div>';
    }
  }

  function renderOrders(orders) {
    if (!orders.length) {
      listEl.innerHTML =
        '<div class="orders-empty"><p>You haven\'t placed any orders yet. ' +
        '<a href="clothes.html">Start shopping</a>.</p></div>';
      return;
    }

    listEl.innerHTML = orders.map(function (order) {
      var date = new Date(order.createdAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      var lines = order.items.map(function (item) {
        return (
          '<div class="order-line">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
            '<div class="order-line-info">' +
              '<span class="name">' + escapeHtml(item.name) + '</span>' +
              (item.size ? 'Size: ' + escapeHtml(item.size) + ' · ' : '') + 'Qty: ' + item.quantity +
            '</div>' +
            '<div class="order-line-subtotal">' + (item.price * item.quantity).toFixed(2) + ' EUR</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="order-card">' +
          '<div class="order-card-head">' +
            '<span>Order #' + order.id + ' &middot; ' + date + '</span>' +
            '<strong>' + Number(order.total).toFixed(2) + ' EUR</strong>' +
          '</div>' +
          lines +
        '</div>'
      );
    }).join('');
  }

  loadOrders();
});
