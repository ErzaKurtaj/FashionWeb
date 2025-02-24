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
        const name = 'LONG SKIRT AND TOP';
        const price = '39.95 EUR';
        const image = 'images/set.jpg';
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
        addToCart('LONG SKIRT AND TOP', '39.95 EUR', 'images/set.jpg', selectedSize);
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


document.addEventListener('DOMContentLoaded', function() {
    const learnMoreButtons = document.querySelectorAll('.btn-learn-more');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalDetails = document.getElementById('modal-details');
    const registrationForm = document.getElementById('registration-form');
    const registrationMessage = document.getElementById('registration-message');

    learnMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseType = button.getAttribute('data-course');
            if (courseType === 'shoe-design') {
                modalTitle.textContent = 'Shoe Design Course';
                modalDescription.textContent = 'Master the art of designing footwear that combines comfort with style.';
                modalDetails.textContent = 'This course covers advanced techniques in shoe design, including material selection, pattern making, and manufacturing processes. Classes are held on Mondays and Wednesdays from 10 AM to 12 PM.';
            } else if (courseType === 'clothes-design') {
                modalTitle.textContent = 'Hand Bag Design Course';
                modalDescription.textContent = 'Create fashion-forward handbag pieces that define trends and captivate hearts.';
                modalDetails.textContent = 'Join us for an immersive journey into clothes design, covering sketching, fabric manipulation, and garment construction. Classes are scheduled on Tuesdays and Thursdays from 2 PM to 4 PM.';
            }

            modalOverlay.style.display = 'flex';
        });
    });

    modalClose.addEventListener('click', function() {
        modalOverlay.style.display = 'none';
        registrationMessage.style.display = 'none'; // Hide registration message on modal close
    });

    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(registrationForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');

        // Simulate registration completion message
        registrationMessage.textContent = `Thank you, ${name}! Your registration is complete.`;
        registrationMessage.style.display = 'block';

        // Optionally, you can clear the form fields or close the modal
        // modalOverlay.style.display = 'none';
        // registrationForm.reset();
    });
});


