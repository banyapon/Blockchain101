async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const Election = await ethers.getContractFactory("Election");
    const contract = Election.attach(contractAddress);
    const allCandidates = [
        "Alice",
        "Bob",
        "Charlie",
        "Diana",
        "Eve",
        "Frank",
        "Grace",
        "Hannah",
    ];
    console.log("------Current Votes Score------");
    for (const candidate of allCandidates) {
        const votes = await contract.getVotes(candidate);
        console.log(`Votes for ${candidate}: ${votes.toString()} votes`);
    }
    console.log("------------------------------");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}