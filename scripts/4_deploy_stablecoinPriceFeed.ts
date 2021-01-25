import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

let price: string;
if (!process.env.STABLECOIN_PRICE) {
  throw new Error("Please set STABLECOIN_PRICE as an env variable");
} else {
  price = process.env.STABLECOIN_PRICE;
}

let description: string;
if (!process.env.STABLECOIN_PRICE_FEED_DESCRIPTION) {
  throw new Error("Please set STABLECOIN_PRICE_FEED_DESCRIPTION as an env variable");
} else {
  description = process.env.STABLECOIN_PRICE_FEED_DESCRIPTION;
}

async function main(): Promise<void> {
  const stablecoinPriceFeedFactory: ContractFactory = await ethers.getContractFactory("StablecoinPriceFeed");
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
