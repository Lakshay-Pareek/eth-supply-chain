# AgriTrace: Blockchain-based Farm‑to‑Consumer Traceability

AgriTrace is a lightweight, decentralized system to track agricultural produce from farm to consumer. It offers transparent origin, quality, and pricing information across the supply chain, and enables verification by farmers, distributors, retailers, and consumers.

## Features

- Role-gated workflow: Farmer → Distributor → Retailer
- Batch registry: origin, crop type, harvest date, quality, price
- Tamper-evident history with on-chain events
- QR code generation for consumer trace
- Minimal static UI (no build) + MetaMask support

## Tech Stack

- Smart contracts: Solidity 0.8.x (Hardhat)
- Chain: Any EVM chain (tested with local Hardhat; configurable for Sepolia)
- UI: Static HTML/JS/CSS with `ethers.js` and `qrcode` via CDN

## Project Structure

```
contracts/           # Hardhat project (Solidity + deploy scripts)
  contracts/
    ProduceRegistry.sol
  scripts/
    deploy.js
  hardhat.config.js
  package.json
public/              # Static web UI (open in a browser)
  index.html
  app.js
  styles.css
```

## Prerequisites

- Node.js LTS
- Browser with MetaMask installed

## Quick Start (Local)

### One command (runs node, deploy, and serves the UI) (leave running)
```bash
cd contracts
npx hardhat node
# UI: http://localhost:5174
```

### Manual steps

1. 2nd Terminal

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

2. 3rd Terminal

```bash
npx serve public -l 5174
```


## Using the App

- **Admin (deployer)**: assign roles to addresses (Farmer, Distributor, Retailer)
- **Farmer**: create batch (origin, crop, harvest date, quality, price)
  - A QR is generated that encodes `{ contract, batchId }`
- **Owner actions**: update quality/price, transfer forward only
  - Enforced flow: Farmer → Distributor → Retailer
- **Retailer**: finalize to mark sold to consumer
- **Anyone**: trace by Batch ID to see full history

## Contract Overview

`contracts/contracts/ProduceRegistry.sol`

- Roles: Admin (deployer manages roles), Farmer, Distributor, Retailer
- Batch data: metadata CID/URL, origin, crop type, harvest date, quality (0–100), unit price (wei), current owner/role, finalized flag
- Events: `UserRoleUpdated`, `BatchCreated`, `BatchTransferred`, `BatchUpdated`, `BatchFinalized`
- Functions (high-level):
  - `setUserRole(user, role)`
  - `createBatch(metadataCID, origin, crop, harvestDate, quality, price)`
  - `updateQualityAndPrice(batchId, quality, price)`
  - `transferBatch(batchId, to, note)`
  - `finalizeToConsumer(batchId, note)`
  - `getBatch(batchId)`, `getHistoryLength(batchId)`, `getHistoryRecord(batchId, i)`

## Deploy to Testnet (Sepolia)

1. Create `contracts/.env` with:

```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
SEPOLIA_RPC_URL=https://YOUR_RPC
ETHERSCAN_API_KEY=YOUR_KEY   # optional, for verify
```

2. Install and compile, then deploy:

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## QR and Consumer Flow

- When a batch is created, the UI generates a QR with `{ c: contractAddress, b: batchId }`.
- Retailers can display the QR at point of sale for consumers to scan and trace.
- You can host `public/` with any static file server.

## Security Notes

- This is a reference prototype. Before production:
  - Add access control reviews and unit tests
  - Consider pausing/upgrade patterns if needed
  - Add off-chain indexer for scalable consumer queries
  - Verify contracts on Etherscan

## Roadmap

- Camera-based QR scanner (PWA) and mobile-first UI
- Role self-registration with attestations
- Oracles for market pricing, quality audits
- Batch splitting/merging and multi-asset support

## License

MIT
