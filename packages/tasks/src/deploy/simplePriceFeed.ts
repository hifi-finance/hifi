import * as core from "@actions/core";
import type { SimplePriceFeed } from "@hifi/protocol/dist/types/SimplePriceFeed";
import { SimplePriceFeed__factory } from "@hifi/protocol/dist/types/factories/SimplePriceFeed__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_SIMPLE_PRICE_FEED } from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_SIMPLE_PRICE_FEED)
  // Contract arguments
  .addParam("description", "Description of the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const simplePriceFeedFactory: SimplePriceFeed__factory = new SimplePriceFeed__factory(signers[0]);
    const simplePriceFeed: SimplePriceFeed = <SimplePriceFeed>await simplePriceFeedFactory.deploy(taskArgs.description);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: simplePriceFeed,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("simple-price-feed", simplePriceFeed.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "SimplePriceFeed", address: simplePriceFeed.address }]);
    }

    return simplePriceFeed.address;
  });
