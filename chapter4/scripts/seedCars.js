async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const CarRental = await ethers.getContractFactory("CarRental");
  const contract  = await CarRental.attach(contractAddress);

  const brands = ["Toyota Camry", "Honda Civic", "Tesla Model 3"];
  for (let i = 0; i < brands.length; i++) {
    const tx = await contract.addCar(brands[i]);
    await tx.wait();
    console.log(`Added car #${i}: ${brands[i]}`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});