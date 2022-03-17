import * as core from "@actions/core";
import type { StablecoinPriceFeed } from "@hifi/protocol/dist/types/StablecoinPriceFeed";
import { StablecoinPriceFeed__factory } from "@hifi/protocol/dist/types/factories/StablecoinPriceFeed__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_STABLECOIN_PRICE_FEED,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_STABLECOIN_PRICE_FEED)
  // Contract arguments
  .addParam("price", "Immutable price of the stablecoin, with 8 decimals of precision")
  .addParam("description", "Description of the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const stablecoinPriceFeedFactory: StablecoinPriceFeed__factory = new StablecoinPriceFeed__factory(signers[0]);
    const stablecoinPriceFeed: StablecoinPriceFeed = <StablecoinPriceFeed>(
      await stablecoinPriceFeedFactory.deploy(taskArgs.price, taskArgs.description)
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: stablecoinPriceFeed,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("stablecoin-price-feed", stablecoinPriceFeed.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "StablecoinPriceFeed", address: stablecoinPriceFeed.address }]);
    }
    return stablecoinPriceFeed.address;
  });
