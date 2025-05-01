// Initialize blockchain connection and load orders
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if user is authenticated
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        const initialized = await initBlockchain();
        if (!initialized) {
            showError('Failed to initialize blockchain connection');
            return;
        }

        // Update UI with user info
        updateUserInfo(user);

        await loadOrders();
        setupEventListeners();
    } catch (error) {
        console.error('Error in initialization:', error);
        showError('Failed to initialize: ' + error.message);
    }
});

// Update UI with user info
function updateUserInfo(user) {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.innerHTML = `
            <span>Welcome, ${user.name}</span>
            <button class="btn logout-btn" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
}

// Load orders from blockchain
async function loadOrders() {
    try {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<div class="loading">Loading orders...</div>';

        if (!contract || !accounts || !accounts[0]) {
            throw new Error('Blockchain not properly initialized');
        }

        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        // Get all orders for the connected wallet
        const orders = await getOrdersForAddress(accounts[0]);
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<div class="no-orders">No orders found</div>';
            return;
        }

        // Display orders
        ordersList.innerHTML = '';
        orders.forEach(order => {
            const orderElement = createOrderElement(order);
            ordersList.appendChild(orderElement);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders: ' + error.message);
    }
}

// Create order element
function createOrderElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = `order-card status-${order.status.toLowerCase()}`;
    
    orderDiv.innerHTML = `
        <div class="order-header">
            <h3>Order #${order.id}</h3>
            <span class="status-badge">${order.status}</span>
        </div>
        <div class="order-details">
            <p><strong>Product:</strong> ${order.productName}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Total Amount:</strong> ${order.totalAmount} ETH</p>
            <p><strong>Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
        </div>
        <div class="order-actions">
            ${order.status === 'Pending' ? `
                <button class="btn cancel-btn" onclick="cancelOrder(${order.id})">
                    Cancel Order
                </button>
            ` : ''}
            ${order.status === 'Delivered' ? `
                <button class="btn confirm-btn" onclick="confirmDelivery(${order.id})">
                    Confirm Delivery
                </button>
            ` : ''}
        </div>
    `;
    
    return orderDiv;
}

// Setup event listeners
function setupEventListeners() {
    // Connect wallet button
    document.getElementById('connect-wallet').addEventListener('click', async () => {
        try {
            const initialized = await initBlockchain();
            if (!initialized) {
                throw new Error('Failed to connect wallet');
            }
            await loadOrders(); // Reload orders after connecting wallet
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showError('Failed to connect wallet: ' + error.message);
        }
    });

    // Status filter
    document.getElementById('status-filter').addEventListener('change', (e) => {
        filterOrders(e.target.value);
    });
}

// Filter orders by status
function filterOrders(status) {
    const orders = document.querySelectorAll('.order-card');
    orders.forEach(order => {
        if (status === 'all' || order.classList.contains(`status-${status.toLowerCase()}`)) {
            order.style.display = 'block';
        } else {
            order.style.display = 'none';
        }
    });
}

// Cancel order
async function cancelOrder(orderId) {
    try {
        if (!contract || !accounts || !accounts[0]) {
            throw new Error('Blockchain not properly initialized');
        }

        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        await updateOrderStatus(orderId, 4); // 4 = Cancelled
        await loadOrders(); // Reload orders after cancellation
    } catch (error) {
        console.error('Error cancelling order:', error);
        showError('Failed to cancel order: ' + error.message);
    }
}

// Confirm delivery
async function confirmDelivery(orderId) {
    try {
        if (!contract || !accounts || !accounts[0]) {
            throw new Error('Blockchain not properly initialized');
        }

        if (!confirm('Confirm that you have received this order?')) {
            return;
        }

        await updateOrderStatus(orderId, 3); // 3 = Delivered
        await loadOrders(); // Reload orders after confirmation
    } catch (error) {
        console.error('Error confirming delivery:', error);
        showError('Failed to confirm delivery: ' + error.message);
    }
}

// Get orders for a specific address
async function getOrdersForAddress(address) {
    try {
        if (!contract || !web3) {
            throw new Error('Contract not initialized');
        }

        // Get all orders from blockchain
        const orders = [];
        const orderIds = await contract.methods.getOrdersForAddress(address).call();
        
        if (!Array.isArray(orderIds)) {
            throw new Error('Invalid response from contract');
        }

        for (const orderId of orderIds) {
            try {
                const order = await getOrder(orderId);
                if (order) {
                    orders.push(order);
                }
            } catch (error) {
                console.error(`Error getting order ${orderId}:`, error);
                // Continue with other orders even if one fails
            }
        }
        
        return orders.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('Error getting orders:', error);
        throw error;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> 
        ${message}
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
} 