const hre = require("hardhat");
async function main() {
    const [user] = await hre.ethers.getSigners();
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const Coupon = await hre.ethers.getContractFactory("SimpleCoupon");
    const coupon = await Coupon.attach(contractAddress);
    const result = await coupon.getMyCoupons();
    console.log(`Coupon of ${user.address}`);
    result.forEach((coupon, index) => {
        console.log(`--- Coupon #${index} ---`);
        console.log(`Code: ${coupon.code}`);
        console.log(`Description: ${coupon.description}`);
        console.log(`Used: ${coupon.isUsed}`);
        console.log(`Owner: ${coupon.owner}`);
        console.log('');
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
