import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

async function main(): Promise<void> {
  const batterseaScriptsV1Factory: ContractFactory = await ethers.getContractFactory("BatterseaScriptsV1");
  const batterseaScriptsV1: Contract = await batterseaScriptsV1Factory.deploy();
  await batterseaScriptsV1.deployed();

  console.log("BatterseaScriptsV1 deployed to: ", batterseaScriptsV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
