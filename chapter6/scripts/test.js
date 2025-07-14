const { ethers } = require("hardhat");

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  console.log(`Test running with deployer: ${deployer.address}`);
  console.log(`Simulating user1: ${user1.address}`);

  // 1. Deploy contract
  const ItemWeapon = await ethers.getContractFactory("ItemWeapon");
  const itemWeapon = await ItemWeapon.deploy();
  await itemWeapon.waitForDeployment();
  const contractAddress = await itemWeapon.getAddress();
  console.log(`Contract deployed at: ${contractAddress}`);

  // 2. Mint weapon to user1
  const txMint = await itemWeapon.mintWeapon(
    //user1.address,
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    "Thunder Axe",
    "A heavy axe crackling with lightning.",
    "ipfs://example-image-hash"
  );
  await txMint.wait();
  console.log(`Minted 'Thunder Axe' to ${user1.address}`);

  // 3. Call getMyWeapons as user1
  const weapons = await itemWeapon.connect(user1).getMyWeapons();
  console.log(`user1 owns ${weapons.length} weapon(s):`);
  weapons.forEach((w, i) => {
    console.log(`  #${i}: ${w.itemName}, Used: ${w.isUsed}, IPFS: ${w.image}`);
  });

  // 4. Mark weapon as used (tokenId = 0)
  const markTx = await itemWeapon.connect(user1).markAsUsed(0);
  await markTx.wait();
  console.log(`user1 marked weapon #0 as used.`);

  // 5. Check again
  const updated = await itemWeapon.connect(user1).getMyWeapons();
  console.log(`After update:`);
  console.log(`Weapon #0 used? → ${updated[0].isUsed}`);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exitCode = 1;
});
