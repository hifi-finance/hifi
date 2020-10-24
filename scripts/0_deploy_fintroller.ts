import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "@nomiclabs/buidler";

async function main(): Promise<void> {
  const fintrollerFactory: ContractFactory = await ethers.getContractFactory("Fintroller");
  const fintroller: Contract = await fintrollerFactory.deploy();
  await fintroller.deployed();

  console.log("Fintroller deployed to: ", fintroller.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
