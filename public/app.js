(function () {
  let provider;
  let signer;
  let contract;

  const abi = [
    {
      inputs: [
        { internalType: "address", name: "user", type: "address" },
        { internalType: "uint8", name: "role", type: "uint8" },
      ],
      name: "setUserRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "metadataCID", type: "string" },
        { internalType: "string", name: "originFarm", type: "string" },
        { internalType: "string", name: "cropType", type: "string" },
        { internalType: "uint256", name: "harvestDate", type: "uint256" },
        { internalType: "uint256", name: "qualityScore", type: "uint256" },
        { internalType: "uint256", name: "unitPriceWei", type: "uint256" },
      ],
      name: "createBatch",
      outputs: [{ internalType: "uint256", name: "batchId", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "batchId", type: "uint256" },
        { internalType: "uint256", name: "qualityScore", type: "uint256" },
        { internalType: "uint256", name: "unitPriceWei", type: "uint256" },
      ],
      name: "updateQualityAndPrice",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "batchId", type: "uint256" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "string", name: "note", type: "string" },
      ],
      name: "transferBatch",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "batchId", type: "uint256" },
        { internalType: "string", name: "note", type: "string" },
      ],
      name: "finalizeToConsumer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "batchId", type: "uint256" }],
      name: "getBatch",
      outputs: [
        { internalType: "uint256", name: "id", type: "uint256" },
        { internalType: "string", name: "metadataCID", type: "string" },
        { internalType: "string", name: "originFarm", type: "string" },
        { internalType: "string", name: "cropType", type: "string" },
        { internalType: "uint256", name: "harvestDate", type: "uint256" },
        { internalType: "uint256", name: "qualityScore", type: "uint256" },
        { internalType: "uint256", name: "unitPriceWei", type: "uint256" },
        { internalType: "address", name: "currentOwner", type: "address" },
        { internalType: "uint8", name: "currentOwnerRole", type: "uint8" },
        { internalType: "bool", name: "finalized", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "batchId", type: "uint256" }],
      name: "getHistoryLength",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "batchId", type: "uint256" },
        { internalType: "uint256", name: "index", type: "uint256" },
      ],
      name: "getHistoryRecord",
      outputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint8", name: "toRole", type: "uint8" },
        { internalType: "uint256", name: "timestamp", type: "uint256" },
        { internalType: "string", name: "note", type: "string" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const $ = (id) => document.getElementById(id);

  function requireContract() {
    const address = $("contractAddress").value.trim();
    if (!address) throw new Error("Contract address required");
    contract = new ethers.Contract(address, abi, signer);
  }

  $("connectBtn").onclick = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    alert("Wallet connected: " + (await signer.getAddress()));
  };

  $("loadContractBtn").onclick = () => {
    try {
      requireContract();
      alert("Contract loaded");
    } catch (e) {
      alert(e.message);
    }
  };

  $("setRoleBtn").onclick = async () => {
    try {
      requireContract();
      const user = $("roleUser").value.trim();
      const role = parseInt($("roleSelect").value, 10);
      const tx = await contract.setUserRole(user, role);
      await tx.wait();
      alert("Role set");
    } catch (e) {
      alert(e.message);
    }
  };

  $("createBatchBtn").onclick = async () => {
    try {
      requireContract();
      const cid = $("cid").value.trim();
      const origin = $("origin").value.trim();
      const crop = $("crop").value.trim();
      const harvest = new Date($("harvest").value).getTime() / 1000;
      const quality = BigInt($("quality").value || 0);
      const price = BigInt($("price").value || 0);
      const tx = await contract.createBatch(
        cid,
        origin,
        crop,
        harvest,
        quality,
        price
      );
      const receipt = await tx.wait();
      // read nextBatchId indirectly by parsing event or calling getBatch on known id
      // simpler: find BatchCreated in logs
      const event = receipt.logs.find(
        (l) => l.fragment && l.fragment.name === "BatchCreated"
      );
      let batchId;
      if (event && event.args) batchId = event.args[0].toString();
      $("createResult").textContent = "Created Batch ID: " + batchId;
      // Generate QR (encode simple JSON with contract and batchId)
      const payload = JSON.stringify({
        c: $("contractAddress").value.trim(),
        b: batchId,
      });
      const canvas = $("qrCanvas");
      window.QRCode.toCanvas(canvas, payload, { width: 220 });
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  $("updateQPBtn").onclick = async () => {
    try {
      requireContract();
      const id = BigInt($("batchIdUpdate").value || 0);
      const q = BigInt($("qualityUpdate").value || 0);
      const p = BigInt($("priceUpdate").value || 0);
      const tx = await contract.updateQualityAndPrice(id, q, p);
      await tx.wait();
      alert("Updated");
    } catch (e) {
      alert(e.message);
    }
  };

  $("transferBtn").onclick = async () => {
    try {
      requireContract();
      const id = BigInt($("batchIdTransfer").value || 0);
      const to = $("toAddress").value.trim();
      const note = $("note").value.trim();
      const tx = await contract.transferBatch(id, to, note);
      await tx.wait();
      alert("Transferred");
    } catch (e) {
      alert(e.message);
    }
  };

  $("finalizeBtn").onclick = async () => {
    try {
      requireContract();
      const id = BigInt($("batchIdFinalize").value || 0);
      const note = $("finalNote").value.trim();
      const tx = await contract.finalizeToConsumer(id, note);
      await tx.wait();
      alert("Finalized");
    } catch (e) {
      alert(e.message);
    }
  };

  $("viewBtn").onclick = async () => {
    try {
      requireContract();
      const id = BigInt($("batchIdView").value || 0);
      const b = await contract.getBatch(id);
      const histLen = Number(await contract.getHistoryLength(id));
      const history = [];
      for (let i = 0; i < histLen; i++) {
        const r = await contract.getHistoryRecord(id, i);
        history.push({
          from: r[0],
          to: r[1],
          toRole: Number(r[2]),
          timestamp: Number(r[3]),
          note: r[4],
        });
      }
      $("batchView").textContent = JSON.stringify(
        {
          id: b[0].toString(),
          metadataCID: b[1],
          originFarm: b[2],
          cropType: b[3],
          harvestDate: Number(b[4]),
          qualityScore: Number(b[5]),
          unitPriceWei: b[6].toString(),
          currentOwner: b[7],
          currentOwnerRole: Number(b[8]),
          finalized: b[9],
          history,
        },
        null,
        2
      );
    } catch (e) {
      alert(e.message);
    }
  };
})();
