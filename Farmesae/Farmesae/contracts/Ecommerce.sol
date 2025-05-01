// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Ecommerce is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // Structs
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        uint256 stock;
        address seller;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Order {
        uint256 id;
        uint256 productId;
        uint256 quantity;
        uint256 totalAmount;
        address buyer;
        address seller;
        OrderStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct Seller {
        address sellerAddress;
        string name;
        uint256 balance;
        uint256 totalSales;
        bool isActive;
    }
    
    // Enums
    enum OrderStatus { Pending, Confirmed, Shipped, Delivered, Cancelled, Refunded }
    
    // State Variables
    Counters.Counter private _productIds;
    Counters.Counter private _orderIds;
    
    mapping(uint256 => Product) public products;
    mapping(uint256 => Order) public orders;
    mapping(address => Seller) public sellers;
    mapping(address => uint256[]) public buyerOrders;
    mapping(address => uint256[]) public sellerOrders;
    mapping(address => uint256) public balances;
    
    // Events
    event ProductCreated(uint256 indexed productId, string name, uint256 price);
    event ProductUpdated(uint256 indexed productId, string name, uint256 price);
    event OrderCreated(uint256 indexed orderId, address indexed buyer, uint256 totalAmount);
    event OrderStatusChanged(uint256 indexed orderId, OrderStatus status);
    event PaymentReleased(uint256 indexed orderId, address indexed seller, uint256 amount);
    event RefundIssued(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event SellerRegistered(address indexed seller, string name);
    
    // Modifiers
    modifier onlySeller() {
        require(sellers[msg.sender].isActive, "Not a registered seller");
        _;
    }
    
    modifier productExists(uint256 productId) {
        require(products[productId].id != 0, "Product does not exist");
        _;
    }
    
    modifier orderExists(uint256 orderId) {
        require(orders[orderId].id != 0, "Order does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        _productIds.increment(); // Start product IDs from 1
        _orderIds.increment();   // Start order IDs from 1
    }
    
    // Seller Functions
    function registerSeller(string memory name) external {
        require(sellers[msg.sender].sellerAddress == address(0), "Seller already registered");
        sellers[msg.sender] = Seller({
            sellerAddress: msg.sender,
            name: name,
            balance: 0,
            totalSales: 0,
            isActive: true
        });
        emit SellerRegistered(msg.sender, name);
    }
    
    // Product Functions
    function createProduct(
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock
    ) external onlySeller {
        uint256 productId = _productIds.current();
        _productIds.increment();
        
        products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            price: price,
            stock: stock,
            seller: msg.sender,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit ProductCreated(productId, name, price);
    }
    
    function updateProduct(
        uint256 productId,
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock
    ) external onlySeller productExists(productId) {
        require(products[productId].seller == msg.sender, "Not the product seller");
        
        products[productId].name = name;
        products[productId].description = description;
        products[productId].price = price;
        products[productId].stock = stock;
        
        emit ProductUpdated(productId, name, price);
    }
    
    // Order Functions
    function createOrder(uint256 productId, uint256 quantity) 
        external 
        payable 
        nonReentrant 
        productExists(productId) 
    {
        Product storage product = products[productId];
        require(product.isActive, "Product is not active");
        require(product.stock >= quantity, "Insufficient stock");
        require(msg.value == product.price * quantity, "Incorrect payment amount");
        
        uint256 orderId = _orderIds.current();
        _orderIds.increment();
        
        orders[orderId] = Order({
            id: orderId,
            productId: productId,
            quantity: quantity,
            totalAmount: msg.value,
            buyer: msg.sender,
            seller: product.seller,
            status: OrderStatus.Pending,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        // Update product stock
        product.stock -= quantity;
        
        // Update buyer and seller order lists
        buyerOrders[msg.sender].push(orderId);
        sellerOrders[product.seller].push(orderId);
        
        emit OrderCreated(orderId, msg.sender, msg.value);
    }
    
    function updateOrderStatus(uint256 orderId, OrderStatus newStatus) 
        external 
        orderExists(orderId) 
    {
        Order storage order = orders[orderId];
        require(
            msg.sender == order.seller || msg.sender == order.buyer,
            "Not authorized to update order"
        );
        
        // Validate status transitions
        if (msg.sender == order.seller) {
            require(
                (order.status == OrderStatus.Pending && newStatus == OrderStatus.Confirmed) ||
                (order.status == OrderStatus.Confirmed && newStatus == OrderStatus.Shipped) ||
                (order.status == OrderStatus.Shipped && newStatus == OrderStatus.Delivered),
                "Invalid status transition for seller"
            );
        } else {
            require(
                (order.status == OrderStatus.Pending && newStatus == OrderStatus.Cancelled) ||
                (order.status == OrderStatus.Delivered && newStatus == OrderStatus.Refunded),
                "Invalid status transition for buyer"
            );
        }
        
        order.status = newStatus;
        order.updatedAt = block.timestamp;
        
        emit OrderStatusChanged(orderId, newStatus);
        
        // Handle payment release or refund
        if (newStatus == OrderStatus.Delivered) {
            _releasePayment(orderId);
        } else if (newStatus == OrderStatus.Refunded) {
            _processRefund(orderId);
        }
    }
    
    // Internal Functions
    function _releasePayment(uint256 orderId) internal {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Delivered, "Order not delivered");
        
        uint256 sellerAmount = order.totalAmount;
        uint256 platformFee = (sellerAmount * 2) / 100; // 2% platform fee
        
        // Update seller balance
        sellers[order.seller].balance += (sellerAmount - platformFee);
        sellers[order.seller].totalSales += order.totalAmount;
        
        emit PaymentReleased(orderId, order.seller, sellerAmount - platformFee);
    }
    
    function _processRefund(uint256 orderId) internal {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Refunded, "Order not refunded");
        
        // Return funds to buyer
        (bool success, ) = order.buyer.call{value: order.totalAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundIssued(orderId, order.buyer, order.totalAmount);
    }
    
    // View Functions
    function getProduct(uint256 productId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock,
        address seller,
        bool isActive
    ) {
        Product storage product = products[productId];
        return (
            product.id,
            product.name,
            product.description,
            product.price,
            product.stock,
            product.seller,
            product.isActive
        );
    }
    
    function getOrder(uint256 orderId) external view returns (
        uint256 id,
        uint256 productId,
        uint256 quantity,
        uint256 totalAmount,
        address buyer,
        address seller,
        OrderStatus status,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        Order storage order = orders[orderId];
        return (
            order.id,
            order.productId,
            order.quantity,
            order.totalAmount,
            order.buyer,
            order.seller,
            order.status,
            order.createdAt,
            order.updatedAt
        );
    }
    
    function getSellerOrders() external view returns (uint256[] memory) {
        return sellerOrders[msg.sender];
    }
    
    function getBuyerOrders() external view returns (uint256[] memory) {
        return buyerOrders[msg.sender];
    }
    
    // Withdrawal Functions
    function withdrawSellerBalance() external onlySeller nonReentrant {
        uint256 amount = sellers[msg.sender].balance;
        require(amount > 0, "No balance to withdraw");
        
        sellers[msg.sender].balance = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    // Admin Functions
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function toggleProductStatus(uint256 productId) external onlyOwner productExists(productId) {
        products[productId].isActive = !products[productId].isActive;
    }
    
    function toggleSellerStatus(address sellerAddress) external onlyOwner {
        require(sellers[sellerAddress].sellerAddress != address(0), "Seller not found");
        sellers[sellerAddress].isActive = !sellers[sellerAddress].isActive;
    }
} 