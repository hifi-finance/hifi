import { SimplePriceFeed } from "@hifi/protocol/typechain/SimplePriceFeed";
import { SimplePriceFeed__factory } from "@hifi/protocol/typechain/factories/SimplePriceFeed__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { TASK_DEPLOY_SIMPLE_PRICE_FEED } from "../constants";

task(TASK_DEPLOY_SIMPLE_PRICE_FEED)
  .addParam("description", "The description of the price feed")
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const simplePriceFeedFactory: SimplePriceFeed__factory = new SimplePriceFeed__factory(signers[0]);
    const simplePriceFeed: SimplePriceFeed = <SimplePriceFeed>await simplePriceFeedFactory.deploy(taskArgs.description);
    await simplePriceFeed.deployed();
    return simplePriceFeed.address;
  });
