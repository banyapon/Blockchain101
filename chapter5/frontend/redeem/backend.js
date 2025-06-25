const contractABI = [
  "function awardCoupon(address to, string memory code, string memory description, string memory image) public",
  "function markAsUsed(uint256 tokenId) public",
  "function getMyCoupons() public view returns (tuple(string code, string description, string image, bool isUsed, address owner)[])",
  "function getCoupon(uint256 tokenId) public view returns (string memory, string memory, string memory, bool, address)",
  "function ownerCoupons(address user, uint256 index) public view returns (uint256)"
];
const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // replace!

let provider, signer, contract;
const statusDiv = document.getElementById("status");
const currentAccountSpan = document.getElementById("currentAccount");

function displayStatus(msg, type) {
  statusDiv.textContent = msg;
  statusDiv.className = type;
}

async function connectWallet() {
  if (!window.ethereum) {
    displayStatus("Please install MetaMask.", "error");
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    const account = await signer.getAddress();
    currentAccountSpan.textContent = account;
    displayStatus("Wallet connected!", "success");
  } catch (err) {
    console.error(err);
    displayStatus(`Connection failed: ${err.message}`, "error");
  }
}

async function awardCoupon() {
  if (!contract) return displayStatus("Connect wallet first.", "error");
  const to = document.getElementById("awardToAddress").value.trim();
  const code = document.getElementById("awardCode").value.trim();
  const desc = document.getElementById("awardDescription").value.trim();
  const img = document.getElementById("awardImage").value.trim();
  if (!ethers.utils.isAddress(to)) {
    return displayStatus("Invalid address.", "error");
  }
  if (!code || !desc) {
    return displayStatus("Code & description required.", "error");
  }
  try {
    displayStatus("Awarding…", "info");
    const tx = await contract.awardCoupon(to, code, desc, img);
    await tx.wait();
    displayStatus(`Awarded! Tx: ${tx.hash}`, "success");
  } catch (e) {
    console.error(e);
    displayStatus(`Error: ${e.reason || e.message}`, "error");
  }
}

async function markAsUsed() {
  if (!contract) return displayStatus("Connect wallet first.", "error");
  const id = document.getElementById("markUsedTokenId").value;
  if (!id) return displayStatus("Enter token ID.", "error");
  try {
    displayStatus(`Marking #${id}…`, "info");
    const tx = await contract.markAsUsed(id);
    await tx.wait();
    displayStatus(`Coupon #${id} used. Tx: ${tx.hash}`, "success");
  } catch (e) {
    console.error(e);
    displayStatus(`Error: ${e.reason || e.message}`, "error");
  }
}

async function getMyCoupons() {
  if (!contract) return displayStatus("Connect wallet first.", "error");
  try {
    displayStatus("Fetching coupons…", "info");
    const coupons = await contract.getMyCoupons();
    const list = document.getElementById("myCouponsList");
    list.innerHTML = "";
    if (coupons.length === 0) {
      list.innerHTML = "<p>No coupons found.</p>";
      return displayStatus("No coupons.", "info");
    }
    const account = await signer.getAddress();
    const ids = await Promise.all(
      coupons.map((_, i) => contract.ownerCoupons(account, i))
    );
    coupons.forEach((c, i) => {
      const tokenId = ids[i].toString();
      const card = document.createElement("div");
      card.className = "coupon-card";
      card.innerHTML = `
              <h3>Coupon ID: ${tokenId}</h3>
              <p><strong>Code:</strong> ${c.code}</p>
              <p><strong>Description:</strong> ${c.description}</p>
              <p><strong>Status:</strong> ${
                c.isUsed
                  ? '<span style="color:red;">Used</span>'
                  : '<span style="color:green;">Unused</span>'
              }</p>
              ${c.image ? `<img src="${c.image}" />` : ""}
            `;
      list.appendChild(card);
    });
    displayStatus("Coupons loaded.", "success");
  } catch (e) {
    console.error(e);
    displayStatus(`Error: ${e.reason || e.message}`, "error");
  }
}

async function getCouponDetails() {
  if (!contract) return displayStatus("Connect wallet first.", "error");
  const id = document.getElementById("getCouponId").value;
  if (!id) return displayStatus("Enter token ID.", "error");
  try {
    displayStatus(`Loading #${id}…`, "info");
    const [code, desc, img, used, ownerAddr] = await contract.getCoupon(id);
    document.getElementById("couponDetails").innerHTML = `
            <p><strong>Code:</strong> ${code}</p>
            <p><strong>Description:</strong> ${desc}</p>
            <p><strong>Image:</strong> ${img || "N/A"}</p>
            <p><strong>Used:</strong> ${used ? "Yes" : "No"}</p>
            <p><strong>Owner:</strong> ${ownerAddr}</p>
          `;
    displayStatus(`Details for #${id} loaded.`, "success");
  } catch (e) {
    console.error(e);
    displayStatus(`Error: ${e.reason || e.message}`, "error");
  }
}
