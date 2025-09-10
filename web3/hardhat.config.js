require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */


module.exports = {
    solidity: "0.8.28",
    networks: {

        hardhat: {},

        localhost: {
            url: "http://127.0.0.1:8545",
        },
/*
        sepolia: {
            url: process.env.PROVIDER_URL,
            accounts: [`0x${process.env.PRIVATE_KEY}`],
        },
*/
    },
};
