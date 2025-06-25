const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "image",
        type: "string",
      },
    ],
    name: "awardCoupon",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "coupons",
    outputs: [
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "image",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isUsed",
        type: "bool",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getCoupon",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyCoupons",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "code",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "image",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isUsed",
            type: "bool",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct SimpleCoupon.Coupon[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "markAsUsed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextTokenId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "ownerCoupons",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

let signer, userAddress;

async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const name = await contract.name();
  const symbol = await contract.symbol();
  document.getElementById(
    "wallet"
  ).innerText += ` | Contract: ${name} (${symbol})`;
  await loadCoupon();
  await loadMyCoupons();
}

async function loadCoupon() {
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

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

  const container = document.getElementById("coupon");
  container.innerHTML = "";

  for (const coupon of coupons) {
    container.innerHTML += `
  <div class="col">
    <div class="coupon h-100">
      <img src="${coupon.image}" alt="coupon" />
      <p><strong>Code:</strong> ${coupon.code}</p>
      <p><strong>Description:</strong> ${coupon.description}</p>
      <button class="btn btn-success" onclick="claimCoupon('${coupon.code}', '${coupon.description}', '${coupon.image}')">
        Claim Coupon
      </button>
    </div>
  </div>`;
  }
}

async function loadMyCoupons() {
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const myCoupons = await contract.getMyCoupons(); // ดึงข้อมูล coupon ทั้งหมดของผู้ใช้
  const myContainer = document.getElementById("myCoupons");
  myContainer.innerHTML = "";

  for (let i = 0; i < myCoupons.length; i++) {
    const tokenId = await contract.ownerCoupons(userAddress, i); // ดึง tokenId ตาม index
    const coupon = myCoupons[i];

    myContainer.innerHTML += `
  <div class="col">
    <div class="coupon h-100">
      <img src="${coupon.image}" alt="coupon" />
      <p><strong>Token ID:</strong> ${tokenId}</p>
      <p><strong>Code:</strong> ${coupon.code}</p>
      <p><strong>Description:</strong> ${coupon.description}</p>
      <p><strong>Used:</strong> ${coupon.isUsed ? "Yes" : "No"}</p>
    </div>
  </div>`;
  }
}

async function claimCoupon(code, description, image) {
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.awardCoupon(userAddress, code, description, image);
  await tx.wait();
  alert("Coupon claimed successfully!");
  await loadMyCoupons();
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("connectBtn")
    .addEventListener("click", connectWallet);
});
