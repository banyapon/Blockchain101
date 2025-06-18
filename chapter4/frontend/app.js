(async function () {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = [
    {
      inputs: [{ internalType: "string", name: "_brand", type: "string" }],
      name: "addCar",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_carId", type: "uint256" }],
      name: "bookCar",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_carId", type: "uint256" }],
      name: "returnCar",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCarCount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_carId", type: "uint256" }],
      name: "getCar",
      outputs: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "string", name: "brand", type: "string" },
        { internalType: "bool", name: "available", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getRecordCount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_index", type: "uint256" }],
      name: "getRecord",
      outputs: [
        { internalType: "uint256", name: "carId", type: "uint256" },
        { internalType: "address", name: "renter", type: "address" },
        { internalType: "bool", name: "isReturn", type: "bool" },
        { internalType: "uint256", name: "timestamp", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  let provider, signer, contract;

  function showNotification(msg, type = "success") {
  const note = document.getElementById("notification");
  if (!note) return;
  // type: "success", "danger"
  note.textContent = msg;
  note.className = `alert alert-${type}`; 
  note.classList.remove("d-none");
  setTimeout(() => note.classList.add("d-none"), 4000);
}

  async function initEthereum() {
    if (!window.ethereum) {
      alert("กรุณาติดตั้ง MetaMask ก่อนใช้งาน");
      return false;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    return true;
  }

  async function loadCars() {
    const container = document.querySelector("#cars-list");
    container.innerHTML = "";
    try {
      const count = Number(await contract.getCarCount());
      if (count === 0) {
        container.textContent = "ยังไม่มีรถในระบบ";
        return;
      }

      for (let i = 0; i < count; i++) {
        const car = await contract.getCar(BigInt(i));
        const id = car.id.toString();
        const brand = car.brand;
        const available = car.available;

        const card = document.createElement("div");
        card.className = "car-card" + (available ? "" : " unavailable");

        const info = document.createElement("div");
        info.className = "car-info";
        info.textContent = `ID: ${id}, Brand: ${brand}, ${
          available ? "ว่าง" : "ถูกเช่า"
        }`;

        const btn = document.createElement("button");
        btn.textContent = available ? "จองรถ" : "คืนรถ";
        btn.className = "car-button " + (available ? "book" : "return");
        btn.onclick = async () => {
          try {
            const tx = available
              ? await contract.bookCar(BigInt(id))
              : await contract.returnCar(BigInt(id));
            await tx.wait();
            showNotification("✅ สำเร็จ", "success");
            await loadCars();
            await loadHistory();
          } catch (err) {
            console.error(err);
            showNotification("❌ ล้มเหลว", "error");
          }
        };

        card.append(info, btn);
        container.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      showNotification("❌ โหลดรถล้มเหลว", "error");
    }
  }

  async function loadHistory() {
    // ดึง <tbody> จากตารางประวัติ
    const tbody = document.querySelector("#history-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    try {
      // !!!!! เปลี่ยนตรงนี้ จาก getCarCount เป็น getRecordCount
      const count = Number(await contract.getRecordCount());

      if (count === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>ยังไม่มีประวัติ</td></tr>";
        return;
      }

      for (let i = 0; i < count; i++) {
        const r = await contract.getRecord(BigInt(i));
        const carId = r.carId.toString();
        const renter = r.renter;
        const action = r.isReturn ? "คืนรถ" : "จองรถ";
        const dateStr = new Date(Number(r.timestamp) * 1000).toLocaleString(
          "th-TH",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${carId}</td>
        <td>${renter}</td>
        <td>${action}</td>
        <td>${dateStr}</td>
      `;
        tbody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
      showNotification("❌ โหลดประวัติล้มเหลว", "danger");
    }
  }

  document
    .querySelector("#refresh-history")
    .addEventListener("click", loadHistory);

  if (await initEthereum()) {
    await loadCars();
    await loadHistory();
  }
})();
