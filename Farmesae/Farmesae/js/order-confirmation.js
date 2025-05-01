document.addEventListener('DOMContentLoaded', function() {
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        showError('No order ID provided');
        return;
    }

    // Load order details
    loadOrderDetails(orderId);
    updateCartCount();
});

function loadOrderDetails(orderId) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id.toString() === orderId);

    if (!order) {
        showError('Order not found');
        return;
    }

    // Update order information
    document.getElementById('order-id').textContent = order.id;
    document.getElementById('order-date').textContent = new Date(order.date).toLocaleDateString();
    document.getElementById('order-status').textContent = order.status;
    document.getElementById('payment-id').textContent = order.paymentId || 'N/A';

    // Update shipping information
    document.getElementById('shipping-name').textContent = order.shipping.name;
    document.getElementById('shipping-address').textContent = 
        `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.pincode}, ${order.shipping.country}`;
    document.getElementById('shipping-phone').textContent = order.shipping.phone;
    document.getElementById('shipping-email').textContent = order.shipping.email;

    // Update order items
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';

    order.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">x ${item.quantity}</span>
            </div>
            <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        itemsList.appendChild(itemElement);
    });

    // Update totals
    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = '₹0.00';
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.confirmation-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
} 