import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import { HifiPool, HifiPool__factory } from "../../typechain";

const name: string = getEnvVar("HIFI_POOL_NAME");
const symbol: string = getEnvVar("HIFI_POOL_SYMBOL");
const hTokenAddress: string = getEnvVar("H_TOKEN_ADDRESS");

async function main(): Promise<void> {
  const hifiPoolFactory: HifiPool__factory = await ethers.getContractFactory("HifiPool");
  const hifiPool: HifiPool = <HifiPool>await hifiPoolFactory.deploy(name, symbol, hTokenAddress);
  await hifiPool.deployed();
  console.log("HifiPool deployed to: ", hifiPool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
