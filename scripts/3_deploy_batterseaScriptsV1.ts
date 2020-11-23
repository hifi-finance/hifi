import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

const wethAddress: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function main(): Promise<void> {
  const batterseaScriptsV1Factory: ContractFactory = await ethers.getContractFactory("BatterseaScriptsV1");
  const batterseaScriptsV1: Contract = await batterseaScriptsV1Factory.deploy(wethAddress);
  await batterseaScriptsV1.deployed();

  console.log("BatterseaScriptsV1 deployed to: ", batterseaScriptsV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
