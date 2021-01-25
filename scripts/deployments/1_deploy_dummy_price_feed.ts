import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

let description: string;
if (!process.env.SIMPLE_PRICE_FEED_DESCRIPTION) {
  throw new Error("Please set SIMPLE_PRICE_FEED_DESCRIPTION as an env variable");
} else {
  description = process.env.SIMPLE_PRICE_FEED_DESCRIPTION;
}

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
