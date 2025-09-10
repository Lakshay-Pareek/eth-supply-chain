// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SupplyChainModule", (m) => {
  // Deploy the SupplyChain contract
  const supplyChain = m.contract("SupplyChain"); // Assuming SupplyChain.sol is in the contracts directory

  return { supplyChain };
});
