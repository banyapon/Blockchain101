const hre = require("hardhat");

async function main() {
  const [user] = await hre.ethers.getSigners();

  const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"
  const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
  const coupon = await Coupon.attach(contractAddress);

  // Get only this user's coupons
  const ownedCoupons = await coupon.getMyCoupons();

  if (ownedCoupons.length === 0) {
    console.log("No coupons found for this user.");
    return;
  }

  for (let i = 0; i < ownedCoupons.length; i++) {
    const couponData = ownedCoupons[i];
    console.log(`Coupon #${i}`);
    console.log(`- Code: ${couponData.code}`);
    console.log(`- Description: ${couponData.description}`);
    console.log(`- Image: ${couponData.image}`);
    console.log(`- Used: ${couponData.isUsed}`);
    console.log(`- Owner: ${couponData.owner}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
