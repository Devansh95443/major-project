// Initialize blockchain connection
document.addEventListener('DOMContentLoaded', async () => {
    await initBlockchain();
    loadProductDetails();
    setupEventListeners();
});

// Load product details from URL parameters
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('Product ID not found');
        return;
    }

    // Get product details from blockchain
    getProductDetails(productId)
        .then(product => {
            if (!product) {
                showError('Product not found');
                return;
            }

            // Update UI with product details
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-price').textContent = `$${product.price}`;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-stock').textContent = product.stock;
            document.getElementById('product-image').src = product.imageUrl || 'images/default-product.jpg';
        })
        .catch(error => {
            console.error('Error loading product:', error);
            showError('Failed to load product details');
        });
}

// Setup event listeners
function setupEventListeners() {
    // Connect wallet button
    document.getElementById('connect-wallet').addEventListener('click', async () => {
        try {
            await connectWallet();
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showError('Failed to connect wallet');
        }
    });

    // Add to cart button
    document.getElementById('add-to-cart').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        const productId = new URLSearchParams(window.location.search).get('id');
        
        if (!productId) {
            showError('Product ID not found');
            return;
        }

        addToCart(productId, quantity);
    });

    // Buy now button
    document.getElementById('buy-now').addEventListener('click', async () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        const productId = new URLSearchParams(window.location.search).get('id');
        
        if (!productId) {
            showError('Product ID not found');
            return;
        }

        try {
            // Show transaction status
            const txStatus = document.querySelector('.transaction-status');
            txStatus.style.display = 'block';
            document.getElementById('tx-status').textContent = 'Processing...';

            // Create order on blockchain
            const tx = await createOrder(productId, quantity);
            
            // Update transaction status
            document.getElementById('tx-status').textContent = 'Completed';
            document.getElementById('tx-hash').textContent = tx.hash;
            
            // Redirect to order confirmation page
            window.location.href = `order-confirmation.html?tx=${tx.hash}`;
        } catch (error) {
            console.error('Error creating order:', error);
            showError('Failed to create order');
            document.getElementById('tx-status').textContent = 'Failed';
        }
    });
}

// Add to cart function
function addToCart(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            quantity: quantity
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    alert('Product added to cart successfully!');
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Show error message
function showError(message) {
    alert(message);
} 