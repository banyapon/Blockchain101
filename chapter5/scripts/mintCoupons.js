const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners(); 
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; 
  const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
  const coupon = await Coupon.attach(contractAddress);

  console.log(`Minting coupons from owner account: ${owner.address}...`);
  await coupon.connect(owner).awardCoupon(
    owner.address,
    "SUMMER25XXX",
    "ส่วนลด 25% สำหรับสินค้าฤดูร้อน",
    "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeicbkzsw55xmtjpwr6f6yewh3tajqybop2jem7s5b4z7drul64k534"
  );
  console.log("Minted coupon with code: SUMMER25XXX");
  await coupon.connect(owner).awardCoupon(
    owner.address,"SUMMER25YYY","ส่วนลด 25% สำหรับสินค้าฤดูร้อน",
    "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeicbkzsw55xmtjpwr6f6yewh3tajqybop2jem7s5b4z7drul64k534"
  );
  console.log("Minted coupon with code: SUMMER25XXX");
  console.log("Coupons minted and assigned successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});