const hre = require("hardhat");

async function main() {
    // Contract address from our deployment
    const CONTRACT_ADDRESS = "0xCc70742dad497cC63722A8157069187A2A5CD5C8";
    
    // Get the contract instance
    const Ecommerce = await hre.ethers.getContractFactory("Ecommerce");
    const ecommerce = await Ecommerce.attach(CONTRACT_ADDRESS);
    
    console.log("Interacting with Ecommerce contract at:", CONTRACT_ADDRESS);
    
    try {
        // 1. Create a new product
        console.log("\n1. Creating a new product...");
        const productPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH
        const tx1 = await ecommerce.createProduct(
            "Premium Product",
            "This is a premium product with special features",
            productPrice,
            5 // stock quantity
        );
        await tx1.wait();
        console.log("Product created successfully!");
        
        // 2. Get all products by seller
        console.log("\n2. Getting seller's products...");
        const sellerProducts = await ecommerce.getSellerOrders();
        console.log("Seller's products:", sellerProducts.map(id => Number(id)));
        
        // 3. Get specific product details
        console.log("\n3. Getting latest product details...");
        const product = await ecommerce.getProduct(2); // Get the second product
        console.log("Product details:", {
            id: Number(product[0]),
            name: product[1],
            description: product[2],
            price: hre.ethers.formatEther(product[3]),
            stock: Number(product[4]),
            seller: product[5],
            isActive: product[6]
        });
        
        // 4. Create an order for the new product
        console.log("\n4. Creating an order for the new product...");
        const tx2 = await ecommerce.createOrder(2, 1, {
            value: productPrice
        });
        await tx2.wait();
        console.log("Order created successfully!");
        
        // 5. Get order details
        console.log("\n5. Getting order details...");
        const order = await ecommerce.getOrder(2);
        console.log("Order details:", {
            id: Number(order[0]),
            productId: Number(order[1]),
            quantity: Number(order[2]),
            totalAmount: hre.ethers.formatEther(order[3]),
            buyer: order[4],
            seller: order[5],
            status: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"][Number(order[6])],
            createdAt: new Date(Number(order[7]) * 1000).toLocaleString(),
            updatedAt: new Date(Number(order[8]) * 1000).toLocaleString()
        });
        
        // 6. Update order status (as seller)
        console.log("\n6. Updating order status to Confirmed...");
        const tx3 = await ecommerce.updateOrderStatus(2, 1); // 1 = Confirmed
        await tx3.wait();
        console.log("Order status updated successfully!");
        
    } catch (error) {
        console.error("Error:", error.message);
        // Get more details about the error if available
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 