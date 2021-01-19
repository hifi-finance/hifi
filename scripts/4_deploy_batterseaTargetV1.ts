import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

async function main(): Promise<void> {
  const batterseaTargetV1Factory: ContractFactory = await ethers.getContractFactory("BatterseaTargetV1");
  const batterseaTargetV1: Contract = await batterseaTargetV1Factory.deploy();
  await batterseaTargetV1.deployed();

  console.log("BatterseaTargetV1 deployed to: ", batterseaTargetV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
