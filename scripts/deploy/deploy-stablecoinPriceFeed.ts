import { Contract } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import { StablecoinPriceFeed__factory } from "../../typechain";

const price: string = getEnvVar("STABLECOIN_PRICE");
const description: string = getEnvVar("STABLECOIN_PRICE_FEED_DESCRIPTION");

async function main(): Promise<void> {
  const stablecoinPriceFeedFactory: StablecoinPriceFeed__factory = await ethers.getContractFactory(
    "StablecoinPriceFeed",
  );
  const stablecoinPriceFeed: Contract = await stablecoinPriceFeedFactory.deploy(price, description);
  await stablecoinPriceFeed.deployed();
  console.log("StablecoinPriceFeed deployed to: ", stablecoinPriceFeed.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
