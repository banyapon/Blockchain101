const hre = require("hardhat");
async function main() {
  const [user] = await hre.ethers.getSigners(); 
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // <--- Update this!
  const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
  const coupon = await Coupon.attach(contractAddress);
  const result = await coupon.getMyCoupons();
  console.log(`Coupon of ${user.address}, result ${result.length}, details below: ${coupon}`);
  for (const c of result) {
    console.log(
      `Code: ${c.code}, Description: ${c.description}, Image: ${c.image}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
