async function main() {
	const Factory = await ethers.getContractFactory("ProduceRegistry");
	const contract = await Factory.deploy();
	await contract.waitForDeployment();
	console.log("ProduceRegistry deployed to:", await contract.getAddress());
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});


