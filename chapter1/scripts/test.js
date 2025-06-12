async function main() {
    const [deployer] = await ethers.getSigners();
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    const Hello = await ethers.getContractFactory("HelloBlockchain");
    const hello = await Hello.attach(contractAddress);
    console.log("Contract message is:", await hello.message());
    const tx = await hello.setMessage("VS Code is awesome!");
    await tx.wait();
    console.log("Updated contract message is:", await hello.message());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});