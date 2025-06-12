async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
  const Invoice = await ethers.getContractFactory("InvoiceSystem");
  const contract = await Invoice.attach(contractAddress);

  //ยิงค่าลงใน Contract ตรงๆ ผ่าน Code
  const tx = await contract.issueInvoice("Texas Company Limited",75000n);
  await tx.wait();

  const count = await contract.getInvoiceCount();
  const invoice = await contract.getInvoice(count - 1n);
  const id = invoice[0].toString();

  const amount = invoice[2].toString();
  const customer = invoice[1];
  console.log(`Invoice ID: ${id} : Customer: ${customer} : Amount: ${amount}`);
  console.log("Invoice issued successfully!");
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
