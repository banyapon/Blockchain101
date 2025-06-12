async function main() {
  const Invoice = await ethers.getContractFactory("InvoiceSystem");
  const contract = await Invoice.deploy();
  console.log("InvoiceSystem deployed to:", contract.target);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
