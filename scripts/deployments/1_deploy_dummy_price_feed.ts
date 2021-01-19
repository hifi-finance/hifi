import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

let dummyPriceFeedDescription: string;
if (!process.env.DUMMY_PRICE_FEED_DESCRIPTION) {
  throw new Error("Please set DUMMY_PRICE_FEED_DESCRIPTION as an env variable");
} else {
  dummyPriceFeedDescription = process.env.DUMMY_PRICE_FEED_DESCRIPTION;
}

async function main(): Promise<void> {
  const dummyPriceFeedFactory: ContractFactory = await ethers.getContractFactory("DummyPriceFeed");
  const dummyPriceFeed: Contract = await dummyPriceFeedFactory.deploy(dummyPriceFeedDescription);
  await dummyPriceFeed.deployed();

  console.log("DummyPriceFeed deployed to: ", dummyPriceFeed.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
