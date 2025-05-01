// Contract ABI and address
const CONTRACT_ADDRESS = "0xCc70742dad497cC63722A8157069187A2A5CD5C8";
const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "productId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "ProductCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            }
        ],
        "name": "OrderCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "status",
                "type": "uint8"
            }
        ],
        "name": "OrderStatusChanged",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "stock",
                "type": "uint256"
            }
        ],
        "name": "createProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "productId",
                "type": "uint256"
            }
        ],
        "name": "getProduct",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSellerOrders",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "productId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "quantity",
                "type": "uint256"
            }
        ],
        "name": "createOrder",
        "outputs": [],
        "stateMutability": "payable",
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
        "name": "getOrder",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "newStatus",
                "type": "uint8"
            }
        ],
        "name": "updateOrderStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "registerSeller",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawSellerBalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getOrdersForAddress",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Contract instance
let contract;
let web3;
let accounts;

// Initialize Web3 and contract
async function initBlockchain() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            throw new Error('Please install MetaMask to use this application');
        }

        // Request account access
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create Web3 instance
        web3 = new Web3(window.ethereum);
        
        // Create contract instance
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
        // Update UI with connected wallet
        updateWalletUI(accounts[0]);
        
        return true;
    } catch (error) {
        console.error('Error initializing blockchain:', error);
        showError('Failed to connect to blockchain: ' + error.message);
        return false;
    }
}

// Product Management
async function createProduct(name, description, price, stock) {
    try {
        const priceInWei = web3.utils.toWei(price.toString(), 'ether');
        const result = await contract.methods.createProduct(
            name,
            description,
            priceInWei,
            stock
        ).send({ from: accounts[0] });
        
        return result;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

async function getProduct(productId) {
    try {
        const result = await contract.methods.getProduct(productId).call();
        return {
            id: result[0],
            name: result[1],
            description: result[2],
            price: web3.utils.fromWei(result[3], 'ether'),
            stock: result[4],
            seller: result[5],
            isActive: result[6]
        };
    } catch (error) {
        console.error('Error getting product:', error);
        throw error;
    }
}

// Order Management
async function createOrder(productId, quantity) {
    try {
        // Get product details to calculate total amount
        const product = await getProduct(productId);
        const totalAmount = web3.utils.toWei(
            (parseFloat(product.price) * quantity).toString(),
            'ether'
        );

        const result = await contract.methods.createOrder(
            productId,
            quantity
        ).send({
            from: accounts[0],
            value: totalAmount
        });
        
        return result;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

async function getOrder(orderId) {
    try {
        const result = await contract.methods.getOrder(orderId).call();
        return {
            id: result[0],
            productId: result[1],
            quantity: result[2],
            totalAmount: web3.utils.fromWei(result[3], 'ether'),
            buyer: result[4],
            seller: result[5],
            status: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'][result[6]],
            createdAt: new Date(result[7] * 1000),
            updatedAt: new Date(result[8] * 1000)
        };
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const result = await contract.methods.updateOrderStatus(
            orderId,
            status
        ).send({ from: accounts[0] });
        
        return result;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

// Seller Management
async function registerSeller(name) {
    try {
        const result = await contract.methods.registerSeller(name)
            .send({ from: accounts[0] });
        
        return result;
    } catch (error) {
        console.error('Error registering seller:', error);
        throw error;
    }
}

async function withdrawSellerBalance() {
    try {
        const result = await contract.methods.withdrawSellerBalance()
            .send({ from: accounts[0] });
        
        return result;
    } catch (error) {
        console.error('Error withdrawing balance:', error);
        throw error;
    }
}

// UI Updates
function updateWalletUI(address) {
    const walletAddress = document.getElementById('wallet-address');
    if (walletAddress) {
        walletAddress.textContent = address;
        walletAddress.title = address; // Show full address on hover
    }
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> 
        ${message}
    `;
    
    // Add to page
    const container = document.querySelector('.container') || document.body;
    container.prepend(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

// Export functions
window.blockchain = {
    init: initBlockchain,
    createProduct,
    getProduct,
    createOrder,
    getOrder,
    updateOrderStatus,
    registerSeller,
    withdrawSellerBalance
}; 