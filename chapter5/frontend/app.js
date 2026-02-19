const coupons = [
  {
    code: "COUPON1",
    description: "ใช้ 1 Truepoint ลด 5 บาท เมื่อซื้อ 25 บาท",
    image:
      "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon1.jpg",
  },
  {
    code: "COUPON2",
    description: "คูปองเงินสด มูลค่า 5 บาท",
    image:
      "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon2.png",
  },
  {
    code: "COUPON3",
    description: "ใช้ True point ลด 6 บาท เมื่อซื้อ 29 บาท",
    image:
      "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon3.jpg",
  },
  {
    code: "COUPON4",
    description: "ใช้ True point ลด 4 บาท เมื่อซื้อ 7 บาท",
    image:
      "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon4.jpg",
  },
  {
    code: "COUPON5",
    description: "ใช้ True point ลด 3 บาท เมื่อซื้อ 7 บาท",
    image:
      "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon5.jpg",
  },
  {
    code: "COUPON6",
    description: "ใช้ True point ลด 6 บาท",
    image:
      "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeibvd4dgytisz2fuug7q7axvbd47hhbz2jxgoultpepbo7miql2rxa/coupon6.jpg",
  },
];

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // update after deploy
const contractABI = [
  "function claimCoupon(string memory code, string memory description, string memory image) public",
  "function getMyCoupons() public view returns (tuple(string code, string description, string image, bool isUsed, address owner)[])",
];

let provider, signer, contract;

async function ensureContractDeployed() {
  const code = await provider.getCode(contractAddress);
  return code && code !== "0x";
}

document.getElementById("connectBtn").onclick = async () => {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    if (!(await ensureContractDeployed())) {
      alert(
        "Contract not found on current network. Please check contractAddress or switch MetaMask network."
      );
      contract = null;
      return;
    }

    contract = new ethers.Contract(contractAddress, contractABI, signer);
    alert("Connected");
    renderCoupons();
    await renderMyCoupons();
  } else {
    alert("Please install MetaMask!");
  }
};

function renderCoupons() {
  const container = document.getElementById("availableCoupons");
  container.innerHTML = "";
  coupons.forEach((c, idx) => {
    const div = document.createElement("div");
    div.className = "col-12 col-md-6 col-xl-4";
    div.innerHTML = `
          <article class="coupon-card card h-100 border-0 shadow-sm">
          <div class="coupon-media">
            <img class="coupon-img" src="${c.image}" alt="${c.code}" />
          </div>
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title coupon-code mb-0">${c.code}</h5>
              <span class="badge text-bg-success-subtle badge-status">Available</span>
            </div>
            <p class="card-text coupon-desc mb-3">${c.description}</p>
            <button class="btn btn-claim mt-auto" onclick="claimCoupon(${idx})">
              Claim
            </button>
          </div>
          </article>
        `;
    container.appendChild(div);
  });
}

async function claimCoupon(index) {
  if (!contract || !signer || !provider) {
    alert("Please connect wallet first.");
    return;
  }

  if (!(await ensureContractDeployed())) {
    alert(
      "Contract not found on current network. Please check contractAddress or switch MetaMask network."
    );
    return;
  }

  const c = coupons[index];
  try {
    const tx = await contract.claimCoupon(c.code, c.description, c.image);
    await tx.wait();
    alert("Claimed successfully!");
    await renderMyCoupons();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function renderMyCoupons() {
  const container = document.getElementById("myCoupons");
  container.innerHTML = "";
  if (!contract) return;

  let result;
  try {
    result = await contract.getMyCoupons();
  } catch (err) {
    container.innerHTML =
      '<div class="col-12"><div class="empty-state">Cannot load coupons. Contract address or network may be incorrect.</div></div>';
    console.error(err);
    return;
  }

  if (!result.length) {
    container.innerHTML =
      '<div class="col-12"><div class="empty-state">No coupons claimed yet.</div></div>';
    return;
  }
  result.forEach((c) => {
    const div = document.createElement("div");
    div.className = "col-12 col-md-6 col-xl-4";
    div.innerHTML = `
          <article class="coupon-card card h-100 border-0 shadow-sm">
          <div class="coupon-media">
            <img class="coupon-img" src="${c.image}" alt="${c.code}" />
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title coupon-code mb-0">${c.code}</h5>
              <span class="badge ${c.isUsed ? "text-bg-secondary" : "text-bg-success-subtle"} badge-status">
                ${c.isUsed ? "Used" : "Available"}
              </span>
            </div>
            <p class="card-text coupon-desc mb-0">${c.description}</p>
          </div>
          </article>
        `;
    container.appendChild(div);
  });
}
