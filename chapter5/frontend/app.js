const coupons = [
  {
    code: "COUPON10",
    description: "ลด 10% เมื่อซื้อครบ 500 บาท",
    image:
      "https://peach-common-hare-754.mypinata.cloud/ipfs/bafybeibzs35ce2smfphrsxjzmi23kpjivq4earcdk467mgxybiopugo45a",
  },
  {
    code: "COUPON20",
    description: "ลด 20% สำหรับลูกค้าใหม่",
    image:
      "https://peach-common-hare-754.mypinata.cloud/ipfs/bafybeib7cqnoejkla267tu6xvz2efsyauegno3nkp6hsu4ry333kcj3usm",
  },
  {
    code: "FREESHIP",
    description: "จัดส่งฟรีทั่วประเทศ",
    image:
      "https://peach-common-hare-754.mypinata.cloud/ipfs/bafybeifpoduq6xgl6jo4mbrirds7s5mkbrgirm7ndxmtiwtykfh7ruglbm",
  },
];

const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // เปลี่ยนเป็นที่อยู่จริงหลัง Copon deploy
const contractABI = [
  "function awardCoupon(address to, string memory code, string memory description, string memory image) public",
  "function getMyCoupons() public view returns (tuple(string code, string description, string image, bool isUsed, address owner)[])",
];

let provider, signer, contract;

document.getElementById("connectBtn").onclick = async () => {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    alert("Connected");
    renderCoupons();
    renderMyCoupons();
  } else {
    alert("Please install MetaMask!");
  }
};

function renderCoupons() {
  const container = document.getElementById("availableCoupons");
  container.innerHTML = "";
  coupons.forEach((c, idx) => {
    const div = document.createElement("div");
    div.className = "coupon-card mdl-card mdl-shadow--2dp";
    div.innerHTML = `
          <div class="mdl-card__media">
            <img class="coupon-img" src="${c.image}" />
          </div>
          <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">${c.code}</h2>
          </div>
          <div class="mdl-card__supporting-text">${c.description}</div>
          <div class="mdl-card__actions mdl-card--border">
            <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick="claimCoupon(${idx})">
              Claim
            </button>
          </div>
        `;
    container.appendChild(div);
  });
}

async function claimCoupon(index) {
  const c = coupons[index];
  try {
    const tx = await contract.awardCoupon(
      await signer.getAddress(),
      c.code,
      c.description,
      c.image
    );
    await tx.wait();
    alert("Claimed successfully!");
    renderMyCoupons();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function renderMyCoupons() {
  if (!contract) return;
  const result = await contract.getMyCoupons();
  const container = document.getElementById("myCoupons");
  container.innerHTML = "";
  result.forEach((c) => {
    const div = document.createElement("div");
    div.className = "coupon-card mdl-card mdl-shadow--2dp";
    div.innerHTML = `
          <div class="mdl-card__media">
            <img class="coupon-img" src="${c.image}" />
          </div>
          <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">${c.code}</h2>
          </div>
          <div class="mdl-card__supporting-text">${c.description}</div>
          <div class="mdl-card__supporting-text">
            Status: ${c.isUsed ? "Used" : "Available"}
          </div>
        `;
    container.appendChild(div);
  });
}
