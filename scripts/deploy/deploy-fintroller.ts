import { Contract } from "@ethersproject/contracts";
import { ethers, upgrades } from "hardhat";

import { FintrollerV1__factory } from "../../typechain";

async function main(): Promise<void> {
  const fintrollerV1Factory: FintrollerV1__factory = await ethers.getContractFactory("FintrollerV1");
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
