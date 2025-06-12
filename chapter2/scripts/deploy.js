async function main() {
    const Election = await ethers.getContractFactory("Election");
    const contract = await Election.deploy([
        "Alice",
        "Bob",
        "Charlie",
        "Diana",
        "Eve",
        "Frank",
        "Grace",
        "Hannah",
    ]);
    console.log("Election contract deployed to:", contract.target);
}
module.exports = main;
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}