import { ethers } from "hardhat";

import { RegentsTargetV1, RegentsTargetV1__factory } from "../../typechain";

async function main(): Promise<void> {
  const regentsTargetV1Factory: RegentsTargetV1__factory = await ethers.getContractFactory("RegentsTargetV1");
  const regentsTargetV1: RegentsTargetV1 = await regentsTargetV1Factory.deploy();
  await regentsTargetV1.deployed();
  console.log("RegentsTargetV1 deployed to: ", regentsTargetV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
