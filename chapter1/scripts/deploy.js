async function main() {
    const Hello = await ethers.getContractFactory("HelloBlockchain");
    const hello = await Hello.deploy();
    console.log("Contract deployed at:", hello.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});