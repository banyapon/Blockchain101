const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with address:", deployer.address);
  const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
  const coupon = await Coupon.deploy();

  await coupon.waitForDeployment();
  console.log("Coupon deployed to:", await coupon.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
