import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";

const description: string = getEnvVar("SIMPLE_PRICE_FEED_DESCRIPTION");

async function main(): Promise<void> {
  const simplePriceFeedFactory: ContractFactory = await ethers.getContractFactory("SimplePriceFeed");
  const simplePriceFeed: Contract = await simplePriceFeedFactory.deploy(description);
  await simplePriceFeed.deployed();

  console.log("SimplePriceFeed deployed to: ", simplePriceFeed.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
