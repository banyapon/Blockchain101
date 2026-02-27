const hre = require("hardhat");
async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
    const coupon = await Coupon.attach(contractAddress);
    //แก้ไขข้อมูล coupon ที่ต้องการ mint
    const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    // ใส่ address ผู้รับคูปอง
    const code = "COUPON2";
    const description = "ลด 20% เมื่อซื้อครบ 1,200 บาท";
    const image = "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon1.jpg"
    const tx = await coupon.awardCoupon(recipient, code, description, image);
    await tx.wait();
    console.log(`Coupon "${code}" awarded to ${recipient} \nDescription: ${description} \nImage: ${image}`);
    console.log("Transaction hash:", tx.hash);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
