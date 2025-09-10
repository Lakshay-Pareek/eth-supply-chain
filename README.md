🚀 Setup Instructions
1. Clone the Repository
git clone https://github.com/<your-org>/eth-supply-chain.git
cd eth-supply-chain

2. Setup the Blockchain (Hardhat)
cd web3
npm install

⚡ Start Local Blockchain with Hardhat
1. Compile Contracts
npx hardhat compile


➡️ Run this every time before testing or deploying to update ABI, Bytecode, and Metadata.

✅ What to look for:

Terminal output:

Compiled 1 Solidity file successfully


Check artifacts/ folder:

artifacts/contracts/SupplyChain.sol/SupplyChain.json


This file contains:

ABI

Bytecode

Metadata

2. Run Tests

Update the test file inside test/SupplyChain.js, then run:

npx hardhat test

3. Start Local Node

In one terminal:

npx hardhat node


This launches a local blockchain at http://127.0.0.1:8545 with fake accounts & test ETH.

Example accounts:

Account #0: 0xf39Fd6... (10000 ETH)
Private Key: 0xac0974...
Account #1: 0x709979... (10000 ETH)
Private Key: 0x59c699...

4. Deploy Contracts Locally

In another terminal:

npx hardhat ignition deploy ./ignition/modules/SupplyChainModule.js --network localhost


Deployment details are saved in:

ignition/deployments/localhost/SupplyChainModule.json


Example:

{
  "contracts": {
    "SupplyChain": {
      "address": "0x1234...abcd"
    }
  }
}

🔗 Frontend Integration

To connect the frontend (React app):

Get Contract Address
From ignition/deployments/localhost/SupplyChainModule.json.

Get ABI
From:

artifacts/contracts/SupplyChain.sol/SupplyChain.json


Use in React

import SupplyChainABI from "../path/to/SupplyChain.json";

const abi = SupplyChainABI.abi;
const contractAddress = "0x1234...abcd";

🌐 Deploy on Sepolia Testnet
1. Update Hardhat Config

In hardhat.config.js:

sepolia: {
  url: process.env.PROVIDER_URL,
  accounts: [`0x${process.env.PRIVATE_KEY}`],
}

2. Setup .env

Create a .env file inside /web3:

PROVIDER_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key

3. Get API Keys

Infura or Alchemy API Key → Create a project at Infura
 or Alchemy
.

Private Key → Export from MetaMask (⚠️ never share this).

4. Deploy to Sepolia
npx hardhat ignition deploy ./ignition/modules/SupplyChainModule.js --network sepolia


✅ Results:

Contract address will appear in terminal

Deployment saved under:

ignition/deployments/sepolia/SupplyChainModule.json


Use address + ABI in your frontend to connect to Sepolia.
