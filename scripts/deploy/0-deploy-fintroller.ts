import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers, upgrades } from "hardhat";

async function main(): Promise<void> {
  const fintrollerV1Factory: ContractFactory = await ethers.getContractFactory("FintrollerV1");
  const fintroller: Contract = await upgrades.deployProxy(fintrollerV1Factory);
  await fintroller.deployed();
  console.log("Fintroller deployed to: ", fintroller.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
