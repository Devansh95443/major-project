const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Ecommerce = await hre.ethers.getContractFactory("Ecommerce");
  
  // Deploy the contract
  console.log("Deploying Ecommerce contract to Sepolia testnet...");
  const ecommerce = await Ecommerce.deploy();
  
  // Wait for deployment
  await ecommerce.waitForDeployment();
  
  const address = await ecommerce.getAddress();
  console.log("Ecommerce contract deployed to:", address);
  
  // Verify the contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 