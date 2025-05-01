// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Elements
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummaryTotal = document.querySelector('.cart-summary-total');
    const cartCount = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const subtotalElement = document.querySelector('.subtotal');
    const shippingElement = document.querySelector('.shipping');
    const taxElement = document.querySelector('.tax');
    
    // Update checkout button based on cart status
    function updateCheckoutButton() {
        if (!checkoutBtn) return;
        
        if (cart.length === 0) {
            checkoutBtn.classList.add('disabled');
            // Remove existing click listeners
            const newBtn = checkoutBtn.cloneNode(true);
            if (checkoutBtn.parentNode) {
                checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
            }
            // Add new click listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Your cart is empty. Please add some products before checkout.');
            });
        } else {
            checkoutBtn.classList.remove('disabled');
            // Remove existing click listeners
            const newBtn = checkoutBtn.cloneNode(true);
            if (checkoutBtn.parentNode) {
                checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
            }
            // Add new click listener
            newBtn.addEventListener('click', function() {
                window.location.href = 'checkout.html';
            });
        }
    }
    
    // Update cart count
    function updateCartCount() {
        if (!cartCount) return;
        
        // Get fresh cart data from localStorage to ensure consistency
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        
        // Log for debugging
        console.log('Cart count update in cart.js:', {
            cartContents: currentCart,
            totalItems: totalItems
        });
    }
    
    // Update cart summary total
    function updateCartTotal() {
        // Get products data
        const products = window.products || [];
        
        // Calculate totals in paise (1 rupee = 100 paise)
        let subtotalPaise = 0;
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                subtotalPaise += Math.round(product.price * 100) * item.quantity;
            }
        });
        
        const shippingPaise = subtotalPaise > 0 ? 4000 : 0; // 40 rupees in paise
        const taxPaise = Math.round(subtotalPaise * 0.1); // 10% tax
        const totalPaise = subtotalPaise + shippingPaise + taxPaise;
        
        // Convert back to rupees for display
        const subtotal = (subtotalPaise / 100).toFixed(2);
        const shipping = (shippingPaise / 100).toFixed(2);
        const tax = (taxPaise / 100).toFixed(2);
        const total = (totalPaise / 100).toFixed(2);
        
        // Store the paise values in localStorage for checkout
        localStorage.setItem('cartTotalPaise', totalPaise.toString());
        localStorage.setItem('cartSubtotalPaise', subtotalPaise.toString());
        localStorage.setItem('cartShippingPaise', shippingPaise.toString());
        localStorage.setItem('cartTaxPaise', taxPaise.toString());
        
        // Update display
        if (subtotalElement) subtotalElement.textContent = `₹${parseFloat(subtotal).toLocaleString('en-IN')}`;
        if (shippingElement) shippingElement.textContent = `₹${parseFloat(shipping).toLocaleString('en-IN')}`;
        if (taxElement) taxElement.textContent = `₹${parseFloat(tax).toLocaleString('en-IN')}`;
        if (cartSummaryTotal) cartSummaryTotal.textContent = `₹${parseFloat(total).toLocaleString('en-IN')}`;
    }
    
    // Render cart items
    function renderCartItems() {
        if (!cartItemsContainer) return;
        
        // Get products data
        const products = window.products || [];
        
        // Check if cart is empty
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="products.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            return;
        }
        
        // Render cart items
        cartItemsContainer.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return '';
            
            const itemTotalPaise = Math.round(product.price * 100) * item.quantity;
            const itemTotal = (itemTotalPaise / 100).toFixed(2);
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='../images/farmease_logo.jpg'">
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${product.name}</h3>
                        <p class="cart-item-price">₹${product.price.toLocaleString('en-IN')}/kg</p>
                        <p class="cart-item-category">${product.category}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity">+</button>
                        </div>
                        <div class="item-total">
                            <span>Total: ₹${parseFloat(itemTotal).toLocaleString('en-IN')}</span>
                        </div>
                        <button class="remove-item">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to cart items
        addCartItemEventListeners();
    }
    
    // Add event listeners to cart items
    function addCartItemEventListeners() {
        document.querySelectorAll('.cart-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            const decreaseBtn = item.querySelector('.decrease-quantity');
            const increaseBtn = item.querySelector('.increase-quantity');
            const removeBtn = item.querySelector('.remove-item');
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => updateQuantity(id, -1));
            }
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => updateQuantity(id, 1));
            }
            if (removeBtn) {
                removeBtn.addEventListener('click', () => removeFromCart(id));
            }
        });
    }
    
    // Update quantity
    function updateQuantity(productId, change) {
        let updatedCart = [...cart];
        const itemIndex = updatedCart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            updatedCart[itemIndex].quantity += change;
            if (updatedCart[itemIndex].quantity <= 0) {
                updatedCart = updatedCart.filter(item => item.id !== productId);
            }
            cart = updatedCart;
            updateCart();
        }
    }
    
    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }
    
    // Update cart
    function updateCart() {
        // Remove any duplicate items by combining quantities
        const uniqueCart = [];
        cart.forEach(item => {
            const existingItem = uniqueCart.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                uniqueCart.push({...item});
            }
        });
        
        // Update cart with unique items
        cart = uniqueCart;
        
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        updateCheckoutButton();
        
        // Log for debugging
        console.log('Cart updated:', {
            cartContents: cart,
            totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
        });
    }
    
    // Initialize checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty. Add some products before checkout.');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
    
    // Initialize cart display
    updateCartCount();
    renderCartItems();
    updateCartTotal();
    updateCheckoutButton();
    
    // Log initial cart state
    console.log('Cart initialized:', {
        cartContents: cart,
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    });
}); 