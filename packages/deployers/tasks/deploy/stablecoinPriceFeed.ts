import { StablecoinPriceFeed } from "@hifi/protocol/typechain/StablecoinPriceFeed";
import { StablecoinPriceFeed__factory } from "@hifi/protocol/typechain/factories/StablecoinPriceFeed__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { TASK_DEPLOY_STABLECOIN_PRICE_FEED } from "../constants";

task(TASK_DEPLOY_STABLECOIN_PRICE_FEED)
  .addParam("price", "The immutable price of the stablecoin, with 8 decimals of precision")
  .addParam("description", "The description of the price feed")
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const stablecoinPriceFeedFactory: StablecoinPriceFeed__factory = new StablecoinPriceFeed__factory(signers[0]);
    const stablecoinPriceFeed: StablecoinPriceFeed = <StablecoinPriceFeed>(
      await stablecoinPriceFeedFactory.deploy(taskArgs.price, taskArgs.description)
    );
    await stablecoinPriceFeed.deployed();
    if (taskArgs.printAddress) {
      console.table([{ name: "StablecoinPriceFeed", address: stablecoinPriceFeed.address }]);
    }
    return stablecoinPriceFeed.address;
  });
