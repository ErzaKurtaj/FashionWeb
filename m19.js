document.addEventListener("DOMContentLoaded", function() {
  const userIcon = document.getElementById("user-icon");
  const userDropdown = document.getElementById("user-dropdown");
  const cartIcon = document.getElementById("cart-icon");
  const cartDropdown = document.getElementById("cart-dropdown");

  userIcon.addEventListener("click", function(event) {
      event.stopPropagation();
      userDropdown.classList.toggle("show");
      cartDropdown.classList.remove("show");
  });

  cartIcon.addEventListener("click", function(event) {
      event.stopPropagation();
      cartDropdown.classList.toggle("show");
      userDropdown.classList.remove("show");
  });

  window.addEventListener("click", function(event) {
      if (!userDropdown.contains(event.target) && event.target !== userIcon) {
          userDropdown.classList.remove("show");
      }
      if (!cartDropdown.contains(event.target) && event.target !== cartIcon) {
          cartDropdown.classList.remove("show");
      }
  });

  let selectedSize = null;

  const addToCartButton = document.querySelector('.add-to-cart');
  addToCartButton.addEventListener('click', function() {
      if (!selectedSize) {
          alert('Please choose a size before adding it to cart');
          return;
      }
      const name = 'OVERSIZE CARGO';
      const price = '25.95 EUR';
      const image = 'images/cargo.jpg';
      addToCart(name, price, image, selectedSize);
  });

  function addToCart(name, price, image, size) {
      const cartItemsContainer = document.getElementById('cart-items');
      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
          <img src="${image}" alt="${name}">
          <div>
              <p>${name}</p>
              <p>${price}</p>
              <p>Size: ${size}</p>
          </div>
      `;
      cartItemsContainer.appendChild(itemElement);
      saveCartToLocalStorage();
      updateCartCount(1);
  }

  function removeFromCart() {
      const cartItemsContainer = document.getElementById('cart-items');
      if (cartItemsContainer.children.length > 0) {
          cartItemsContainer.removeChild(cartItemsContainer.lastChild);
          saveCartToLocalStorage();
          updateCartCount(-1);
      }
  }

  function updateCartCount(change) {
      const cartCount = document.getElementById('cart-count');
      let currentCount = parseInt(cartCount.innerText);
      currentCount += change;
      cartCount.innerText = currentCount;
      localStorage.setItem('cartCount', currentCount);
  }

  document.querySelector('.plus-btn').addEventListener('click', function() {
      if (!selectedSize) {
          alert('Please choose a size before adding it to cart');
          return;
      }
      incrementItem();
      addToCart('OVERSIZE CARGO', '25.95 EUR', 'images/cargo.jpg', selectedSize);
  });

  document.querySelector('.minus-btn').addEventListener('click', function() {
      decrementItem();
      removeFromCart();
  });

  function selectSize(sizeElement) {
      const allSizes = document.querySelectorAll('.size-options span');
      allSizes.forEach(size => size.classList.remove('selected'));
      sizeElement.classList.add('selected');
      selectedSize = sizeElement.innerText;
      localStorage.setItem('selectedSize', selectedSize);
  }

  let itemCount = 0;

  function incrementItem() {
      itemCount++;
      updateItemCount();
  }

  function decrementItem() {
      if (itemCount > 0) {
          itemCount--;
          updateItemCount();
      }
  }

  function updateItemCount() {
      const itemCountElement = document.querySelector('.item-count');
      if (itemCountElement) {
          itemCountElement.textContent = itemCount;
      }
      localStorage.setItem('itemCount', itemCount);
  }

  const sizeOptions = document.querySelectorAll('.size-options span');
  sizeOptions.forEach(size => {
      size.addEventListener('click', function() {
          selectSize(size);
      });
  });

  function loadCartFromLocalStorage() {
      const savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const cartItemsContainer = document.getElementById('cart-items');
      savedCartItems.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.className = 'cart-item';
          itemElement.innerHTML = `
              <img src="${item.image}" alt="${item.name}">
              <div>
                  <p>${item.name}</p>
                  <p>${item.price}</p>
                  <p>Size: ${item.size}</p>
              </div>
          `;
          cartItemsContainer.appendChild(itemElement);
      });
      const savedCartCount = localStorage.getItem('cartCount') || 0;
      document.getElementById('cart-count').innerText = savedCartCount;
      itemCount = parseInt(localStorage.getItem('itemCount')) || 0;
      updateItemCount();

      selectedSize = localStorage.getItem('selectedSize');
      if (selectedSize) {
          const sizeElement = Array.from(sizeOptions).find(size => size.innerText === selectedSize);
          if (sizeElement) {
              selectSize(sizeElement);
          }
      }
  }

  function saveCartToLocalStorage() {
      const cartItemsContainer = document.getElementById('cart-items');
      const cartItems = [];
      cartItemsContainer.querySelectorAll('.cart-item').forEach(itemElement => {
          const name = itemElement.querySelector('div p:first-child').innerText;
          const price = itemElement.querySelector('div p:nth-child(2)').innerText;
          const image = itemElement.querySelector('img').src;
          const size = itemElement.querySelector('div p:last-child').innerText.split(': ')[1];
          cartItems.push({ name, price, image, size });
      });
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }

  loadCartFromLocalStorage();
});
