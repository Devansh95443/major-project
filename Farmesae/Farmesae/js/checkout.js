// Checkout Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Checkout page loaded");
    
    // Check cart contents
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Cart contents:", cart);
    
    // Check product data
    console.log("Products data available:", !!window.products);
    if (window.products) {
        console.log("Number of products:", window.products.length);
    }
    
    // Redirect to cart page if cart is empty
    if (cart.length === 0) {
        console.log("Cart is empty, redirecting to cart page");
        alert("Your cart is empty. Please add products to your cart before checkout.");
        window.location.href = "cart.html";
        return;
    }
    
    // Initialize checkout
    initializeCheckout();
    initializeFormValidation();
    initializePaymentStep();
    initializeSmartContractUI();
    renderOrderSummary();
    updateCartCount();
    
    // Connect wallet button
    const connectWalletBtn = document.getElementById('connect-wallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
});

// Initialize checkout functionality
function initializeCheckout() {
    const sections = document.querySelectorAll('.form-section');
    const steps = document.querySelectorAll('.step');
    const btnBack = document.querySelector('.btn-back');
    const btnNext = document.querySelector('.btn-next');
    let currentStep = 0;

    // Show initial step
    showStep(currentStep);

    // Handle next button
    btnNext.addEventListener('click', function(event) {
        if (currentStep < 3) { // Now we have 4 steps: shipping, blockchain, payment, review
            if (validateCurrentStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
                updateReviewSection();
            }
        } else {
            processPayment(event);
        }
    });

    // Handle back button
    btnBack.addEventListener('click', function() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });

    function showStep(step) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show current section
        sections[step].classList.add('active');

        // Update progress steps
        steps.forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index < step) {
                stepEl.classList.add('completed');
            } else if (index === step) {
                stepEl.classList.add('active');
            }
        });

        // Update button text
        if (step === 3) {
            btnNext.textContent = 'Place Order';
        } else {
            btnNext.textContent = 'Continue';
        }

        // Update back button visibility
        btnBack.style.display = step === 0 ? 'none' : 'block';
    }
}

// Form validation
function initializeFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                validateInput(this);
            });

            input.addEventListener('blur', function() {
                validateInput(this);
            });
        }
    });
}

function validateInput(input) {
    if (!input || !input.closest('.form-group')) {
        return true; // Skip validation if input or form group doesn't exist
    }

    const value = input.value.trim();
    const formGroup = input.closest('.form-group');
    let isValid = true;
    let errorMessage = '';

    switch (input.id) {
        case 'fullName':
            isValid = /^[a-zA-Z\s]{2,50}$/.test(value);
            errorMessage = 'Please enter a valid name (2-50 characters, letters only)';
            break;
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'phone':
            isValid = /^[0-9]{10}$/.test(value);
            errorMessage = 'Please enter a valid 10-digit phone number';
            break;
        case 'address':
            isValid = value.length >= 5;
            errorMessage = 'Please enter a valid address';
            break;
        case 'city':
            isValid = /^[a-zA-Z\s]{2,}$/.test(value);
            errorMessage = 'Please enter a valid city name';
            break;
        case 'state':
            isValid = /^[a-zA-Z\s]{2,}$/.test(value);
            errorMessage = 'Please enter a valid state name';
            break;
        case 'pincode':
            isValid = /^[0-9]{6}$/.test(value);
            errorMessage = 'Please enter a valid 6-digit PIN code';
            break;
        case 'upiId':
            if (document.getElementById('upi')?.checked) {
                isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(value);
                errorMessage = 'Please enter a valid UPI ID';
            }
            break;
        case 'cardNumber':
            if (document.getElementById('card')?.checked) {
                isValid = /^[0-9\s]{16,19}$/.test(value.replace(/\s/g, ''));
                errorMessage = 'Please enter a valid card number';
            }
            break;
        case 'expiry':
            if (document.getElementById('card')?.checked) {
                isValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value);
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
            }
            break;
        case 'cvv':
            if (document.getElementById('card')?.checked) {
                isValid = /^[0-9]{3,4}$/.test(value);
                errorMessage = 'Please enter a valid CVV';
            }
            break;
        case 'cardName':
            if (document.getElementById('card')?.checked) {
                isValid = /^[a-zA-Z\s]{2,50}$/.test(value);
                errorMessage = 'Please enter a valid cardholder name';
            }
            break;
    }

    // Update UI
    if (isValid) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    } else {
        formGroup.classList.add('error');
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = errorMessage;
    }

    return isValid;
}

function validateCurrentStep(step) {
    // Skip validation for blockchain step
    if (step === 1) { // Blockchain step
        return true;
    }
    
        let isValid = true;
    const currentSection = document.querySelectorAll('.form-section')[step];
    if (!currentSection) return false;

    const inputs = currentSection.querySelectorAll('input, select');
        inputs.forEach(input => {
        if (!validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

// Payment step initialization
function initializePaymentStep() {
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const upiDetails = document.getElementById('upi-details');
    const cardDetails = document.getElementById('card-details');
    const blockchainDetails = document.getElementById('blockchain-details');

    // Handle payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment details
            if (upiDetails) upiDetails.style.display = 'none';
            if (cardDetails) cardDetails.style.display = 'none';
            if (blockchainDetails) blockchainDetails.style.display = 'none';
            
            // Show selected payment details
            if (this.id === 'upi' && upiDetails) {
                upiDetails.style.display = 'block';
            } else if (this.id === 'card' && cardDetails) {
                cardDetails.style.display = 'block';
            } else if (this.id === 'blockchain' && blockchainDetails) {
                blockchainDetails.style.display = 'block';
                
                // Update wallet address in payment section
                const paymentWalletAddress = document.getElementById('payment-wallet-address');
                const walletAddress = document.getElementById('wallet-address');
                
                if (paymentWalletAddress && walletAddress) {
                    paymentWalletAddress.textContent = walletAddress.textContent;
                }
            }
        });
    });

    // Format card number
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            value = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }

    // Format expiry date
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }
}

// Smart Contract UI Section
function initializeSmartContractUI() {
    // Check if blockchain section exists, if not create it
    let blockchainSection = document.querySelector('.blockchain-section');
    const paymentSection = document.querySelector('.payment-section');
    
    if (!blockchainSection && paymentSection) {
        blockchainSection = document.createElement('div');
        blockchainSection.className = 'blockchain-section form-section';
        blockchainSection.innerHTML = `
            <h2>Blockchain Payment</h2>
            <div class="blockchain-status">
                <p>To use blockchain for your payment, connect your wallet first.</p>
                <div class="wallet-status">
                    <span id="wallet-address">Wallet not connected</span>
                    <button id="connect-wallet" class="action-button">Connect Wallet</button>
                </div>
                <div class="contract-info" style="display: none;">
                    <h3>Smart Contract Details</h3>
                    <p>Contract Address: <span id="contract-address">${CONTRACT_CONFIG.address}</span></p>
                    <div class="contract-balance">
                        <p>Your balance: <span id="wallet-balance">0 ETH</span></p>
                    </div>
                </div>
                <div class="transaction-status" style="display: none;">
                    <h3>Transaction Details</h3>
                    <p>Status: <span id="tx-status">Not started</span></p>
                    <p>Hash: <span id="tx-hash">-</span></p>
                </div>
            </div>
        `;
        
        // Insert before payment section
        const formSectionsContainer = paymentSection.parentNode;
        if (formSectionsContainer) {
            formSectionsContainer.insertBefore(blockchainSection, paymentSection);
        }
    }
}

// Initialize Web3 and Contract
let web3;
let contract;
let accounts = [];

async function initWeb3() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            
            // Request account access
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Initialize contract
            contract = new web3.eth.Contract(CONTRACT_CONFIG.abi, CONTRACT_CONFIG.address);
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
                accounts = newAccounts;
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
            
            return true;
        } else if (window.web3) {
            // Legacy dapp browsers
            web3 = new Web3(window.web3.currentProvider);
            accounts = await web3.eth.getAccounts();
            contract = new web3.eth.Contract(CONTRACT_CONFIG.abi, CONTRACT_CONFIG.address);
            return true;
        } else {
            // Fallback to a local provider (for testing only)
            const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/your-infura-id');
            web3 = new Web3(provider);
            showError('Web3 provider not detected. Please install MetaMask or another wallet to use blockchain features.');
            return false;
        }
    } catch (error) {
        console.error('Web3 initialization error:', error);
        showError('Failed to connect: ' + error.message);
        return false;
    }
}

// Connect wallet function
async function connectWallet() {
    const walletAddressSpan = document.getElementById('wallet-address');
    const walletBalanceSpan = document.getElementById('wallet-balance');
    const connectButton = document.getElementById('connect-wallet');
    const contractInfo = document.querySelector('.contract-info');
    const blockchainPaymentOption = document.getElementById('blockchain-payment-option');
    
    if (!walletAddressSpan || !connectButton) {
        console.error('Wallet UI elements not found');
        return;
    }
    
    try {
        // Update UI to show connecting status
        walletAddressSpan.textContent = 'Connecting...';
        connectButton.disabled = true;
        
        // Initialize Web3
        const web3Initialized = await initWeb3();
        
        if (!web3Initialized) {
            throw new Error('Failed to initialize Web3');
        }
        
        // Display wallet address
        if (accounts && accounts.length > 0) {
            const shortenedAddress = accounts[0].substring(0, 6) + '...' + accounts[0].substring(accounts[0].length - 4);
            walletAddressSpan.textContent = shortenedAddress;
            
            // Update button
            connectButton.textContent = 'Wallet Connected';
            connectButton.disabled = true;
            
            // Show contract info
            if (contractInfo) {
                contractInfo.style.display = 'block';
            }
            
            // Enable blockchain payment option in payment methods
            if (blockchainPaymentOption) {
                blockchainPaymentOption.style.display = 'block';
            }
            
            // Sync wallet address to payment display
            const paymentWalletAddress = document.getElementById('payment-wallet-address');
            if (paymentWalletAddress) {
                paymentWalletAddress.textContent = shortenedAddress;
            }
            
            // Get wallet balance
            try {
                const balance = await web3.eth.getBalance(accounts[0]);
                const ethBalance = web3.utils.fromWei(balance, 'ether');
                if (walletBalanceSpan) {
                    walletBalanceSpan.textContent = parseFloat(ethBalance).toFixed(4) + ' ETH';
                }
            } catch (balanceError) {
                console.error('Error getting balance:', balanceError);
                if (walletBalanceSpan) {
                    walletBalanceSpan.textContent = 'Balance unavailable';
                }
            }
            
            showSuccess('Wallet connected successfully! You can now use blockchain or traditional payment methods.');
        } else {
            throw new Error('No accounts found or access denied');
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showError('Failed to connect wallet: ' + error.message);
        
        // Reset UI
        walletAddressSpan.textContent = 'Connection failed';
        connectButton.textContent = 'Retry Connection';
        connectButton.disabled = false;
    }
}

// Smart Contract Configuration
const CONTRACT_CONFIG = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Ethereum mainnet smart contract address
    abi: [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "orderId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "createOrder",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "orderId",
                    "type": "uint256"
                }
            ],
            "name": "confirmOrder",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};

// Convert ETH to Wei
function toWei(amount) {
    try {
        if (!web3) {
            console.error('Web3 not initialized for wei conversion');
            return '0';
        }
        
        // Ensure amount is a string and properly formatted
        let amountStr = amount.toString();
        
        // Handle large or complex numbers
        if (amountStr.includes('e')) {
            // Convert scientific notation to fixed notation
            amount = parseFloat(amount);
            amountStr = amount.toFixed(18);
        }
        
        // Limit to 18 decimal places max (ETH precision)
        if (amountStr.includes('.')) {
            const parts = amountStr.split('.');
            amountStr = parts[0] + '.' + (parts[1] + '000000000000000000').substring(0, 18);
        }
        
        return web3.utils.toWei(amountStr, 'ether');
    } catch (error) {
        console.error('Error converting to wei:', error);
        return '0';
    }
}

// Create order on blockchain
async function createOrderOnBlockchain(orderData) {
    try {
        // For demo purposes, simulate a successful transaction
        console.log('Demo mode: Simulating blockchain transaction');
        
        // Generate a mock transaction hash
        const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
        
        // Simulate a small delay to mimic blockchain processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return mock transaction result
        return {
            transactionHash: mockTxHash,
            status: 'success'
        };
    } catch (error) {
        console.error('Create order blockchain error:', error);
        throw error;
    }
}

// Confirm order on blockchain
async function confirmOrderOnBlockchain(orderId) {
    try {
        const gas = await contract.methods.confirmOrder(orderId).estimateGas({ from: accounts[0] });
        
        const result = await contract.methods.confirmOrder(orderId)
            .send({ from: accounts[0], gas });
            
        return result.transactionHash;
    } catch (error) {
        console.error('Confirm order error:', error);
        throw error;
    }
}

// Process payment with smart contract - simplified version without actual blockchain integration
async function processPaymentWithContract(orderId, amount) {
    // This is a simplified implementation without actual blockchain integration
    return new Promise((resolve) => {
        // Simulate processing delay
        setTimeout(() => {
            resolve({
                success: true,
                createTxHash: 'tx_' + Math.random().toString(36).substring(2, 15),
                confirmTxHash: 'tx_' + Math.random().toString(36).substring(2, 15)
            });
        }, 2000);
    });
}

// Save order to localStorage
function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
}

// Order summary
function renderOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = window.products || [];
        const summaryItems = document.querySelector('.summary-items');
        const subtotalElement = document.querySelector('.subtotal');
        const shippingElement = document.querySelector('.shipping');
    const taxElement = document.querySelector('.tax');
    const totalElement = document.querySelector('.total');

    if (!summaryItems) return;

        // Clear existing items
        summaryItems.innerHTML = '';

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

        // Calculate totals
        let subtotal = 0;

    // Add cart items
        cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        
        const itemPrice = product.price * item.quantity;
        subtotal += itemPrice;

            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
            <span>${product.name} x ${item.quantity}</span>
            <span>₹${itemPrice.toLocaleString('en-IN')}</span>
            `;
            summaryItems.appendChild(itemElement);
        });

    const shipping = subtotal > 0 ? 40 : 0; // Standard shipping cost
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + shipping + tax;

        // Update totals
    subtotalElement.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    shippingElement.textContent = `₹${shipping.toLocaleString('en-IN')}`;
    taxElement.textContent = `₹${tax.toLocaleString('en-IN')}`;
    totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;

    // Update review section
    updateReviewSection();
}

function updateReviewSection() {
    const shippingReview = document.getElementById('shipping-review');
    const paymentReview = document.getElementById('payment-review');
    const orderReview = document.getElementById('order-review');
    
    if (!shippingReview || !paymentReview || !orderReview) return;

    // Shipping details
    const fullName = document.getElementById('fullName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const state = document.getElementById('state')?.value || '';
    const pincode = document.getElementById('pincode')?.value || '';
    const country = document.getElementById('country')?.value || '';

    shippingReview.innerHTML = `
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}, ${city}, ${state} ${pincode}, ${country}</p>
    `;

    // Payment details
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.id || '';
    let paymentDetails = '';

    if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upiId')?.value || '';
        paymentDetails = `
            <p><strong>Method:</strong> UPI Payment</p>
            <p><strong>UPI ID:</strong> ${upiId}</p>
        `;
    } else if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber')?.value || '';
        const expiry = document.getElementById('expiry')?.value || '';
        const cardName = document.getElementById('cardName')?.value || '';
        
        // Mask card number for security
        const maskedCardNumber = cardNumber.replace(/\s/g, '').slice(-4).padStart(cardNumber.replace(/\s/g, '').length, '*');
        const formattedCardNumber = maskedCardNumber.replace(/(.{4})/g, '$1 ').trim();
        
        paymentDetails = `
            <p><strong>Method:</strong> Credit/Debit Card</p>
            <p><strong>Card Number:</strong> ${formattedCardNumber}</p>
            <p><strong>Expiry:</strong> ${expiry}</p>
            <p><strong>Name:</strong> ${cardName}</p>
        `;
    } else if (paymentMethod === 'blockchain') {
        const walletAddress = document.getElementById('payment-wallet-address')?.textContent || 'Not connected';
        
        paymentDetails = `
            <p><strong>Method:</strong> Blockchain Payment</p>
            <p><strong>Wallet:</strong> ${walletAddress}</p>
            <p><strong>Contract:</strong> ${CONTRACT_CONFIG.address.substring(0, 6)}...${CONTRACT_CONFIG.address.substring(CONTRACT_CONFIG.address.length - 4)}</p>
        `;
    }

    paymentReview.innerHTML = paymentDetails || '<p>No payment method selected</p>';

    // Order details
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = window.products || [];
    
    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            subtotal += product.price * item.quantity;
            itemCount += item.quantity;
        }
    });
    
    const shipping = subtotal > 0 ? 40 : 0;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;

    orderReview.innerHTML = `
        <p><strong>Items:</strong> ${itemCount}</p>
        <p><strong>Subtotal:</strong> ₹${subtotal.toLocaleString('en-IN')}</p>
        <p><strong>Shipping:</strong> ₹${shipping.toLocaleString('en-IN')}</p>
        <p><strong>Tax:</strong> ₹${tax.toLocaleString('en-IN')}</p>
        <p><strong>Total:</strong> ₹${total.toLocaleString('en-IN')}</p>
    `;
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

// Show error notification
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message notification';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const checkoutForm = document.querySelector('.checkout-form');
    if (checkoutForm) {
        checkoutForm.prepend(errorDiv);
        
        // Auto-remove after delay
        setTimeout(() => {
            errorDiv.classList.add('fade-out');
            setTimeout(() => errorDiv.remove(), 500);
        }, 4000);
    } else {
        console.error('Checkout form not found to show error:', message);
        alert(`Error: ${message}`);
    }
}

// Show success notification
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message notification';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    const checkoutForm = document.querySelector('.checkout-form');
    if (checkoutForm) {
        checkoutForm.prepend(successDiv);
        
        // Auto-remove after delay
        setTimeout(() => {
            successDiv.classList.add('fade-out');
            setTimeout(() => successDiv.remove(), 500);
        }, 4000);
    } else {
        console.log('Success:', message);
        alert(`Success: ${message}`);
    }
}

// Process payment with smart contract or traditional methods
async function processPayment(event) {
    // Prevent the default form submission
    if (event) {
        event.preventDefault();
    }
    
    // Get selected payment method
    const blockchainPayment = document.getElementById('blockchain')?.checked || false;
    const walletConnected = document.getElementById('wallet-address')?.textContent !== 'Wallet not connected' 
                          && document.getElementById('wallet-address')?.textContent !== 'Connection failed'
                          && document.getElementById('wallet-address')?.textContent !== 'Connecting...';
    
    // Validate payment information based on selected method
    let isValid = true;
    
    if (!blockchainPayment) {
        const paymentSection = document.querySelector('.payment-section');
        if (!paymentSection) {
            showError('Payment section not found.');
            return;
        }

        const inputs = paymentSection.querySelectorAll('input:not([type="radio"]), select');
        const selectedMethod = document.querySelector('input[name="payment"]:checked')?.id;
        
        inputs.forEach(input => {
            // Only validate inputs relevant to the selected payment method
            if ((selectedMethod === 'upi' && input.id.startsWith('upi')) || 
                (selectedMethod === 'card' && input.id.startsWith('card'))) {
                if (!validateInput(input)) {
                    isValid = false;
                }
            }
        });
        
        if (!isValid) {
            showError('Please fill out all payment information correctly.');
            return;
        }
    } else if (blockchainPayment && !walletConnected) {
        showError('Please connect your wallet to use blockchain payment.');
        return;
    }

    // Get form data
    const formData = getFormData();
    
    // Create order object
    const order = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: getCartItems(),
        shipping: formData,
        total: calculateTotal(),
        status: 'pending'
    };

    // Show processing modal
    const modal = document.getElementById('paymentProcessingModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    try {
        // Process based on selected payment method
        if (blockchainPayment && walletConnected && accounts && accounts.length > 0) {
            // Update transaction status
            const txStatus = document.getElementById('tx-status');
            const txHash = document.getElementById('tx-hash');
            const txStatusContainer = document.querySelector('.transaction-status');
            
            if (txStatusContainer) {
                txStatusContainer.style.display = 'block';
            }
            
            if (txStatus) {
                txStatus.textContent = 'Processing...';
            }
            
            // Process with blockchain
            try {
                const result = await createOrderOnBlockchain(order);
                
                // Update UI with transaction hash
                if (txHash) {
                    txHash.textContent = result.transactionHash;
                }
                
                if (txStatus) {
                    txStatus.textContent = 'Confirmed';
                }
                
                // Update order with transaction details
                order.status = 'completed';
                order.transactionHash = result.transactionHash;
                order.paymentMethod = 'blockchain';
                
                // Save order and clear cart
                saveOrder(order);
                
                // Hide modal
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // Show success
                showSuccess('Order placed successfully! Redirecting to confirmation page...');
                
                // Redirect to confirmation page
                window.location.href = `order-confirmation.html?orderId=${order.id}`;
            } catch (error) {
                if (txStatus) {
                    txStatus.textContent = 'Failed';
                }

                // Check if error is due to user rejection
                if (error.message && error.message.includes('User denied transaction signature')) {
                    // Hide modal
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    
                    // Show user-friendly error message with retry option
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message notification';
                    errorDiv.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i> 
                        Transaction was rejected. Please try again and confirm the transaction in MetaMask.
                        <button class="retry-button" style="margin-left: 10px; padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Retry Transaction
                        </button>
                    `;
                    
                    const checkoutForm = document.querySelector('.checkout-form');
                    if (checkoutForm) {
                        checkoutForm.prepend(errorDiv);
                        
                        // Add retry functionality
                        const retryButton = errorDiv.querySelector('.retry-button');
                        retryButton.addEventListener('click', () => {
                            errorDiv.remove();
                            processPayment(event);
                        });
                    }
                    
                    return;
                }
                
                throw error;
            }
        } else {
            // Traditional payment processing
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.id || 'cod';
            
            try {
                // Process payment with traditional methods
                const result = await processPaymentWithContract(order.id, order.total);
                
                if (result && result.success) {
                    // Update order with transaction details
                    order.status = 'completed';
                    order.transactionHash = result.createTxHash;
                    order.confirmationHash = result.confirmTxHash;
                    order.paymentMethod = paymentMethod;
                    
                    // Save order to localStorage
                    saveOrder(order);
                    
                    // Hide modal
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    
                    // Show success message
                    showSuccess('Order placed successfully! Redirecting to confirmation page...');
                    
                    // Redirect to confirmation page
                    window.location.href = `order-confirmation.html?orderId=${order.id}`;
                } else {
                    throw new Error(result?.error || 'Payment processing failed');
                }
            } catch (error) {
                throw new Error('Payment processing failed: ' + (error.message || 'Unknown error'));
            }
        }
    } catch (error) {
        console.error('Payment error:', error);
        
        // Hide modal
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Show error
        showError('Payment processing failed: ' + (error.message || 'Unknown error'));
    }
}

// Get form data from input fields
function getFormData() {
    return {
        fullName: document.getElementById('fullName')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        pincode: document.getElementById('pincode')?.value || '',
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.id || 'cod'
    };
}

// Get cart items from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Calculate total order amount
function calculateTotal() {
    const cart = getCartItems();
    const products = window.products || [];
    
    let subtotal = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            subtotal += product.price * item.quantity;
        }
    });
    
    const shipping = subtotal > 0 ? 40 : 0;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    return total;
}

// Clear cart after order is placed
function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
} 