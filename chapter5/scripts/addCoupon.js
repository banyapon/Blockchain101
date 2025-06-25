const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
  const coupon = await Coupon.attach(contractAddress);

  console.log(`Minting coupons from owner account: ${owner.address}...`);
  await coupon.connect(owner).awardCoupon(
    owner.address,
    "COUPON099",
    "ส่วนลด 20% สำหรับการสั่งซื้อครั้งที่สอง,สินค้าใดก็ได้ของห้าง",
    "https://peach-common-hare-754.mypinata.cloud/ipfs/bafybeibzs35ce2smfphrsxjzmi23kpjivq4earcdk467mgxybiopugo45a"
  );
  console.log("Minted coupon with code: COUPON099");
  await coupon.connect(owner).awardCoupon(
    owner.address,"COUPON099","ส่วนลด 20% สำหรับการสั่งซื้อครั้งที่สอง,สินค้าใดก็ได้ของห้าง",
    "https://peach-common-hare-754.mypinata.cloud/ipfs/bafybeibzs35ce2smfphrsxjzmi23kpjivq4earcdk467mgxybiopugo45a"
  );
  console.log("Minted coupon with code: SUMMER25");
  console.log("Coupons minted and assigned successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
