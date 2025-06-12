async function main() {
  const [voter] = await ethers.getSigners();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Election = await ethers.getContractFactory("Election");
  const election = Election.attach(contractAddress);

  const tx = await election.vote("Eve");
  await tx.wait();
  const result = await election.getVotes("Eve");
  console.log("Votes for Eve:", result.toString());
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
