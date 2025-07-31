import { ethers } from "hardhat";

async function main() {
  const GradingSSI = await ethers.getContractFactory("GradingSSI");
  const contract = await GradingSSI.deploy();

  await contract.deployed();

  console.log(`GradingSSI deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
