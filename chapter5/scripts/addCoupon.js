const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
  const coupon = await Coupon.attach(contractAddress);
  //แก้ไขข้อมูล coupon ที่ต้องการ mint
  const recipient = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  // ใส่ address ผู้รับคูปอง
  const code = "COUPON02";
  const description = "ส่วนลด 20% สำหรับการสั่งซื้อครั้งที่สอง,สินค้าใดก็ได้ของห้าง";
  const image = "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeihq2zw3hclgdopnigtn3x6xymoilf2ps2675e6n4kajgua2pjra6a"
  const tx = await coupon.awardCoupon(recipient, code, description,image);
  await tx.wait();
  console.log(`Coupon "${code}" awarded to ${recipient} \nDescription: ${description} \nImage: ${image}`);
  console.log("Transaction hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
