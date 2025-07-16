const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with the account: ${deployer.address}`);
  const ItemWeapon = await ethers.getContractFactory("ItemWeapon");
  const itemWeapon = await ItemWeapon.deploy();
  await itemWeapon.waitForDeployment();

  const contractAddress = await itemWeapon.getAddress();
  console.log(`Contract deployed at: ${contractAddress}`);
  // ส่วนที่ทำการ mint อาวุธล่วงหน้าได้ถูกลบออกไปแล้ว
  // ตอนนี้อาวุธจะถูก mint จากในเกมเท่านั้น
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exitCode = 1;
});
