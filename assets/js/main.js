/* ─────────────────────────────────────────────────────────────────────────
   PASSIONIS — main.js
   Handles: header scroll state, scroll-reveal, dropdowns, hamburger,
            training modal, and details-page cart logic.
───────────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Header: transparent → frosted on scroll ─────────────────────── */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav link ─────────────────────────────────────────────── */
  const navLinks = document.querySelectorAll('nav ul li a');
  if (navLinks.length) {
    const p = window.location.pathname;
    const isShoppingPage = p.startsWith('/pages/d') || p === '/pages/details.html';
    navLinks.forEach(function (link) {
      try {
        const linkPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
        const match = linkPath === p
          || (p === '/' && linkPath === '/index.html')
          || (isShoppingPage && linkPath === '/pages/clothes.html');
        if (match) link.classList.add('active');
      } catch (e) {}
    });
  }

  /* ── Scroll-reveal (IntersectionObserver) ────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    reveals.forEach(el => io.observe(el));
  }

  /* ── Dropdowns (user & cart) ─────────────────────────────────────── */
  const userIcon     = document.getElementById('user-icon');
  const userDropdown = document.getElementById('user-dropdown');
  const cartIcon     = document.getElementById('cart-icon');
  const cartDropdown = document.getElementById('cart-dropdown');

  function closeAll() {
    userDropdown && userDropdown.classList.remove('show');
    cartDropdown && cartDropdown.classList.remove('show');
  }

  if (userIcon && userDropdown) {
    userIcon.addEventListener('click', function (e) {
      e.stopPropagation();
      const wasOpen = userDropdown.classList.contains('show');
      closeAll();
      if (!wasOpen) userDropdown.classList.add('show');
    });
  }

  if (cartIcon && cartDropdown) {
    cartIcon.addEventListener('click', function (e) {
      e.stopPropagation();
      const wasOpen = cartDropdown.classList.contains('show');
      closeAll();
      if (!wasOpen) cartDropdown.classList.add('show');
    });
  }

  document.addEventListener('click', function (e) {
    if (userDropdown && !userDropdown.contains(e.target) && e.target !== userIcon) {
      userDropdown.classList.remove('show');
    }
    if (cartDropdown && !cartDropdown.contains(e.target) && e.target !== cartIcon) {
      cartDropdown.classList.remove('show');
    }
  });

  /* ── Hamburger nav toggle ─────────────────────────────────────────── */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mainNav      = document.getElementById('main-nav');
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      mainNav.classList.toggle('nav-open');
    });
    document.addEventListener('click', function () {
      mainNav.classList.remove('nav-open');
    });
    mainNav.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  /* ── Training modal ───────────────────────────────────────────────── */
  const learnMoreBtns     = document.querySelectorAll('.btn-learn-more');
  const modalOverlay      = document.querySelector('.modal-overlay');
  const modalClose        = document.querySelector('.modal-close');
  const modalTitle        = document.getElementById('modal-title');
  const modalDescription  = document.getElementById('modal-description');
  const modalDetails      = document.getElementById('modal-details');
  const registrationForm  = document.getElementById('registration-form');
  const registrationMsg   = document.getElementById('registration-message');

  if (modalOverlay && learnMoreBtns.length) {
    learnMoreBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const type = btn.getAttribute('data-course');
        if (type === 'shoe-design') {
          if (modalTitle)       modalTitle.textContent = 'Shoe Design Course';
          if (modalDescription) modalDescription.textContent = 'Master the art of designing footwear that combines comfort with style.';
          if (modalDetails)     modalDetails.textContent = 'Advanced techniques in shoe design: material selection, pattern making, manufacturing. Mon & Wed 10 AM–12 PM.';
        } else if (type === 'clothes-design') {
          if (modalTitle)       modalTitle.textContent = 'Bags Design Course';
          if (modalDescription) modalDescription.textContent = 'Create fashion-forward handbag pieces that define trends and captivate hearts.';
          if (modalDetails)     modalDetails.textContent = 'Sketching, material selection, and bag construction techniques. Tue & Thu 2 PM–4 PM.';
        }
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (registrationMsg) registrationMsg.style.display = 'none';
  }

  if (registrationForm) {
    registrationForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = registrationForm.querySelector('[name="name"]');
      if (registrationMsg && name) {
        registrationMsg.textContent = `Thank you, ${name.value}! Your registration is complete.`;
        registrationMsg.style.display = 'block';
      }
    });
  }

  /* ── Details page: size selection, quantity, cart ─────────────────── */
  let selectedSize = localStorage.getItem('selectedSize') || null;
  let itemCount = parseInt(localStorage.getItem('itemCount')) || 0;

  /* Size options — works via event delegation AND the global selectSize() */
  const sizeOptionsContainer = document.querySelector('.size-options');
  if (sizeOptionsContainer) {
    sizeOptionsContainer.addEventListener('click', function (e) {
      if (e.target.tagName === 'SPAN') selectSize(e.target);
    });

    /* Restore previously selected size */
    if (selectedSize) {
      const el = Array.from(sizeOptionsContainer.querySelectorAll('span'))
        .find(s => s.textContent.trim() === selectedSize);
      if (el) el.classList.add('selected');
    }
  }

  const qtyDisplay = document.getElementById('quantity-display');
  if (qtyDisplay) qtyDisplay.value = itemCount || 1;

  const plusBtn  = document.querySelector('.plus-btn');
  const minusBtn = document.querySelector('.minus-btn');

  if (plusBtn) {
    plusBtn.addEventListener('click', function () {
      if (!selectedSize) { alert('Please choose a size before adding to cart.'); return; }
      incrementItem();
      addToCart('LONG SKIRT AND TOP', '39.95 EUR', '/assets/images/set.jpg', selectedSize);
    });
  }

  if (minusBtn) {
    minusBtn.addEventListener('click', function () {
      decrementItem();
      removeFromCart();
    });
  }

  const addToCartBtn = document.querySelector('.add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function () {
      if (!selectedSize) { alert('Please choose a size before adding to cart.'); return; }
      addToCart('LONG SKIRT AND TOP', '39.95 EUR', '/assets/images/set.jpg', selectedSize);
    });
  }

  function addToCart(name, price, image, size) {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${image}" alt="${name}">
      <div>
        <p>${name}</p>
        <p>${price}</p>
        <p>Size: ${size}</p>
      </div>`;
    container.appendChild(el);
    saveCart();
    updateCartCount(1);
  }

  function removeFromCart() {
    const container = document.getElementById('cart-items');
    if (container && container.children.length > 0) {
      container.removeChild(container.lastChild);
      saveCart();
      updateCartCount(-1);
    }
  }

  function updateCartCount(delta) {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const next = Math.max(0, (parseInt(badge.textContent) || 0) + delta);
    badge.textContent = next;
    localStorage.setItem('cartCount', next);
  }

  function incrementItem() {
    itemCount++;
    if (qtyDisplay) qtyDisplay.value = itemCount;
    localStorage.setItem('itemCount', itemCount);
  }

  function decrementItem() {
    if (itemCount > 0) {
      itemCount--;
      if (qtyDisplay) qtyDisplay.value = itemCount;
      localStorage.setItem('itemCount', itemCount);
    }
  }

  function saveCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.cart-item')).map(el => ({
      name:  el.querySelector('div p:first-child')?.textContent,
      price: el.querySelector('div p:nth-child(2)')?.textContent,
      image: el.querySelector('img')?.getAttribute('src'),
      size:  el.querySelector('div p:last-child')?.textContent?.split(': ')[1],
    }));
    localStorage.setItem('cartItems', JSON.stringify(items));
  }

  function loadCart() {
    const items    = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const count    = parseInt(localStorage.getItem('cartCount')) || 0;
    const container = document.getElementById('cart-items');
    const badge    = document.getElementById('cart-count');

    if (badge) badge.textContent = count;

    if (container) {
      items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div>
            <p>${item.name}</p>
            <p>${item.price}</p>
            <p>Size: ${item.size}</p>
          </div>`;
        container.appendChild(el);
      });
    }
  }

  loadCart();
  if (qtyDisplay) qtyDisplay.value = itemCount || 1;

  /* ── Search ──────────────────────────────────────────────────── */
  const searchForm         = document.querySelector('.search-form');
  const searchNavInput     = searchForm && searchForm.querySelector('input[name="search"]');
  const searchOverlay      = document.getElementById('search-overlay');
  const searchOverlayInput = document.getElementById('search-overlay-input');
  const searchOverlayClear = document.getElementById('search-overlay-clear');
  const searchResults      = document.getElementById('search-results');
  const searchMeta         = document.getElementById('search-results-meta');
  const searchClose        = document.getElementById('search-close');
  const searchSuggestions  = document.getElementById('search-suggestions');
  const searchBackdrop     = searchOverlay && searchOverlay.querySelector('.search-overlay-backdrop');

  let searchTimer   = null;
  let justClosed    = false;

  /* Open overlay, optionally pre-fill with a query */
  function openSearch(initialQ) {
    if (!searchOverlay) return;
    searchOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      if (searchOverlayInput) searchOverlayInput.focus();
    }, 40);
    if (initialQ && searchOverlayInput && !searchOverlayInput.value) {
      searchOverlayInput.value = initialQ;
      toggleClear();
      if (initialQ.length >= 2) runSearch(initialQ);
    }
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
    justClosed = true;
    setTimeout(function () { justClosed = false; }, 300);
  }

  function toggleClear() {
    if (!searchOverlayClear || !searchOverlayInput) return;
    searchOverlayClear.hidden = !searchOverlayInput.value.trim();
  }

  function resetResults() {
    if (searchResults)     searchResults.innerHTML = '';
    if (searchMeta)        searchMeta.textContent  = '';
    if (searchSuggestions) searchSuggestions.style.display = '';
    document.querySelectorAll('.search-tag').forEach(function (t) {
      t.classList.remove('active');
    });
  }

  if (searchOverlay) {
    /* Nav form: submit → open overlay with pre-filled query */
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        openSearch(searchNavInput ? searchNavInput.value.trim() : '');
      });
    }
    /* Nav input: first keystroke opens overlay */
    if (searchNavInput) {
      searchNavInput.addEventListener('input', function () {
        if (!searchOverlay.classList.contains('active') && !justClosed) {
          openSearch(searchNavInput.value.trim());
          searchNavInput.blur();
        }
      });
    }

    /* Overlay input: live search */
    if (searchOverlayInput) {
      searchOverlayInput.addEventListener('input', function () {
        toggleClear();
        clearTimeout(searchTimer);
        const q = searchOverlayInput.value.trim();
        if (!q) { resetResults(); return; }
        if (q.length < 2) return;
        searchTimer = setTimeout(function () { runSearch(q); }, 280);
      });
      searchOverlayInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          clearTimeout(searchTimer);
          const q = searchOverlayInput.value.trim();
          if (q.length >= 2) runSearch(q);
        }
      });
    }

    /* Clear button */
    if (searchOverlayClear) {
      searchOverlayClear.addEventListener('click', function () {
        searchOverlayInput.value = '';
        toggleClear();
        resetResults();
        searchOverlayInput.focus();
      });
    }

    /* Tag pills */
    document.querySelectorAll('.search-tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        const q = tag.dataset.tag;
        if (searchOverlayInput) {
          searchOverlayInput.value = q;
          toggleClear();
        }
        document.querySelectorAll('.search-tag').forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');
        runSearch(q);
      });
    });

    /* Close */
    if (searchClose)    searchClose.addEventListener('click', closeSearch);
    if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) closeSearch();
    });
  }

  async function runSearch(q) {
    if (!searchOverlay) return;
    if (searchSuggestions) searchSuggestions.style.display = 'none';
    if (searchMeta)        searchMeta.textContent = '';
    if (searchResults) {
      searchResults.innerHTML =
        '<div class="search-loading"><div class="search-dots">' +
        '<span></span><span></span><span></span></div></div>';
    }

    try {
      const res  = await fetch('/api/search?q=' + encodeURIComponent(q));
      if (!res.ok) throw new Error('server');
      const data = await res.json();
      renderResults(data.results, q);
    } catch {
      if (searchResults) {
        searchResults.innerHTML =
          '<div class="search-empty"><p>Something went wrong.</p>' +
          '<span>Please try again.</span></div>';
      }
    }
  }

  function renderResults(results, q) {
    if (!searchResults) return;

    document.querySelectorAll('.search-tag').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tag === q.toLowerCase());
    });

    if (!results || !results.length) {
      if (searchMeta) searchMeta.textContent = '';
      searchResults.innerHTML =
        '<div class="search-empty"><p>No results for "<em>' + q + '</em>"</p>' +
        '<span>Try dress · blazer · heels · a colour</span></div>';
      return;
    }

    if (searchMeta) {
      searchMeta.textContent =
        results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for “' + q + '”';
    }

    searchResults.innerHTML = results.map(function (item) {
      return '<a href="' + item.url + '" class="search-result-item">' +
        '<div class="search-result-img">' +
        '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy"></div>' +
        '<div class="search-result-info">' +
        '<span class="search-result-category">' + item.category + '</span>' +
        '<h4>' + item.name + '</h4>' +
        '<p>' + item.price + '</p></div></a>';
    }).join('');
  }
});

/* selectSize is global so details.html inline onclick="selectSize(this)" works */
window.selectSize = function (el) {
  document.querySelectorAll('.size-options span').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  localStorage.setItem('selectedSize', el.textContent.trim());
};
