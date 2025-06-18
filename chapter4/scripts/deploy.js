// scripts/deploy.js
async function main() {
  // 1. ดึง CarRental contract factory
  const CarRental = await ethers.getContractFactory("CarRental");

  // 2. Deploy contract ไปที่ Hardhat local network
  const contract = await CarRental.deploy();
  await contract.waitForDeployment();

  console.log("CarRental contract deployed at:", contract.target);

  // 3 (Optional) เติมข้อมูล “รถที่มีให้เช่า” จำนวน 3 คัน
  const brands = ["Toyota Camry", "Honda Civic", "Tesla Model 3"];
  for (let i = 0; i < brands.length; i++) {
    const tx = await contract.addCar(brands[i]);
    await tx.wait();
    console.log(`Added car #${i}: ${brands[i]}`);
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});