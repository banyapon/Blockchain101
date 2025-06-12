(async function () {
  // ---------------------------
  // 1. กำหนดค่าเริ่มต้น / ตัวแปรสำคัญ
  // ---------------------------
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <== ตรวจสอบให้แน่ใจว่า Address นี้ถูกต้องทุกครั้งที่ Deploy ใหม่!
  const contractABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "customer",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "issuedBy",
          type: "address",
        },
      ],
      name: "InvoiceIssued",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
      ],
      name: "getInvoice",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "customer",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "issuedBy",
              type: "address",
            },
          ],
          internalType: "struct InvoiceSystem.Invoice",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getInvoiceCount",
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
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "invoices",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "customer",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "issuedBy",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_customer",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "issueInvoice",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "nextId",
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
  ];

  let provider, signer, contract;

  // ---------------------------
  // 2. ฟังก์ชันช่วยเหลือ: แสดง/ซ่อนข้อความแจ้งเตือน
  // ---------------------------
  function showNotification(message, type = "success") {
    const note = document.querySelector("#notification");
    note.textContent = message;
    note.className = type === "success" ? "success" : "error";
    note.style.display = "block";
    setTimeout(() => {
      note.style.display = "none";
    }, 5000); // เพิ่มเวลาแสดงผล
  }

  // ---------------------------
  // 3. ตรวจ MetaMask / เชื่อมต่อ Provider (ปรับปรุงใหม่)
  // ---------------------------
  async function initEthereum() {
    if (typeof window.ethereum === "undefined") {
      showNotification("กรุณาติดตั้ง MetaMask!", "error");
      return false;
    }

    try {
      provider = new ethers.BrowserProvider(window.ethereum);

      // ✨ จุดปรับปรุงที่ 1: ตรวจสอบ Network ID
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
        // Chain ID ของ Hardhat คือ 31337
        showNotification(
          "กรุณาเปลี่ยน Network ใน MetaMask เป็น Localhost 8545",
          "error"
        );
        return false;
      }

      // ขอสิทธิ์เชื่อมต่อบัญชี MetaMask หลังจากเช็ค Network แล้ว
      signer = await provider.getSigner();

      // ตรวจสอบว่ามี Contract ที่ Address ที่ระบุอยู่จริงหรือไม่
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        showNotification("ไม่พบ Contract ที่ Address ที่ระบุ กรุณาตรวจสอบการ Deploy", "error");
        return false;
      }
      
      contract = new ethers.Contract(contractAddress, contractABI, signer);

      console.log(
        "เชื่อมต่อสำเร็จ Network:",
        network.name,
        "ChainId:",
        network.chainId
      );
      console.log("Signer Address:", await signer.getAddress());
      return true;
    } catch (err) {
      console.error("Initialization error:", err);
      showNotification("การเชื่อมต่อ MetaMask ล้มเหลว", "error");
      return false;
    }
  }

  // ---------------------------
  // 4. ฟังก์ชัน: issueInvoice (ปรับปรุงเล็กน้อย)
  // ---------------------------
  async function issueInvoice(customerName, amountValue) {
    if (!contract) {
      showNotification("Contract is not initialized. Please connect to MetaMask.", "error");
      return;
    }
    try {
      // ใช้ ethers.parseUnits เพื่อแปลงค่าเป็น BigInt ที่ถูกต้องตามหลัก (สำหรับ ETH หรือ Token)
      // หาก amount เป็นแค่ตัวเลขธรรมดา ใช้ BigInt(amountValue) ก็ได้
      const tx = await contract.issueInvoice(customerName, BigInt(amountValue));
      showNotification("กำลังสร้างใบเสร็จ... กรุณารอสักครู่", "success");
      await tx.wait(); // รอให้ transaction เข้า block
      showNotification("✅ ออกใบเสร็จสำเร็จ!", "success");
      await loadAllInvoices();
    } catch (err) {
      console.error(err);
      // แสดง reason ของ revert (ถ้ามี) ซึ่งช่วย debug ได้ดีกว่า
      showNotification(
        err.reason || "❌ เกิดข้อผิดพลาดในการออกใบเสร็จ",
        "error"
      );
    }
  }

  // ---------------------------
  // 5. ฟังก์ชัน: loadAllInvoices (ปรับปรุงการดึงข้อมูลและจัดการ Error)
  // ---------------------------
  async function loadAllInvoices() {
    if (!contract) {
      showNotification("Contract is not initialized. Please connect MetaMask.", "error");
      return;
    }
    const tbody = document.querySelector("#invoices-table tbody");
    tbody.innerHTML = '<tr><td colspan="5">กำลังโหลดข้อมูล...</td></tr>';

    try {
      const countBI = await contract.getInvoiceCount();
      const count = Number(countBI);

      if (count === 0) {
        tbody.innerHTML = '<tr><td colspan="5">ยังไม่มีใบเสร็จในระบบ</td></tr>';
        return;
      }

      tbody.innerHTML = ""; // เคลียร์ตารางก่อนแสดงผลจริง

      for (let i = 0; i < count; i++) {
        const invoice = await contract.getInvoice(i);

        // ✨ จุดปรับปรุงที่ 2: เข้าถึงข้อมูลด้วยชื่อ property (อ่านง่ายกว่า)
        const id = invoice.id;
        const customer = invoice.customer;
        const amount = invoice.amount;
        const timestamp = invoice.timestamp;
        const issuedBy = invoice.issuedBy;

        const dateString = new Date(Number(timestamp) * 1000).toLocaleString(
          "th-TH"
        );

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${id.toString()}</td>
            <td>${customer}</td>
            <td>${amount.toString()}</td>
            <td>${dateString}</td>
            <td>${issuedBy}</td>
        `;
        tbody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
      // ✨ จุดปรับปรุงที่ 3: ดักจับ Error `BAD_DATA` โดยเฉพาะ ✨
      if (err.code === "BAD_DATA" && err.value === "0x") {
        const errorMessage =
          "❌ ไม่พบ Contract! กรุณาตรวจสอบว่า: 1. Deploy แล้ว 2. Address ถูกต้อง 3. MetaMask ต่อถูก Network";
        showNotification(errorMessage, "error");
        tbody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">${errorMessage}</td></tr>`;
      } else {
        showNotification("❌ เกิดข้อผิดพลาดในการดึงข้อมูล", "error");
      }
    }
  }

  // ---------------------------
  // 6. เมื่อโหลดเพจเสร็จ ให้อินิท MetaMask + โหลดตาราง
  // ---------------------------
  window.addEventListener("DOMContentLoaded", async () => {
    const initialized = await initEthereum();
    if (initialized) {
      await loadAllInvoices();
    }

    // เพิ่ม Listener เพื่อตรวจจับการเปลี่ยน Account หรือ Network
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  });

  // ---------------------------
  // 7. จับ event การกดปุ่ม “ออกใบเสร็จ”
  // ---------------------------
  document
    .querySelector("#invoice-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const customerName = document
        .querySelector("#customer-input")
        .value.trim();
      const amountValue = document.querySelector("#amount-input").value.trim();

      if (!customerName || !amountValue) {
        showNotification("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
        return;
      }
      await issueInvoice(customerName, amountValue);
      // ล้างฟอร์ม
      document.querySelector("#customer-input").value = "";
      document.querySelector("#amount-input").value = "";
    });

  // ---------------------------
  // 8. จับ event ปุ่ม “รีเฟรชข้อมูล”
  // ---------------------------
  document
    .querySelector("#refresh-button")
    .addEventListener("click", async () => {
      await loadAllInvoices();
    });
})();