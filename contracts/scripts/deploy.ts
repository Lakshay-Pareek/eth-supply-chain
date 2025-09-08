import { ethers } from "hardhat";

async function main() {
	const Factory = await ethers.getContractFactory("ProduceRegistry");
	const contract = await Factory.deploy();
	await contract.waitForDeployment();
	const address = await contract.getAddress();
	console.log("ProduceRegistry deployed to:", address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});


