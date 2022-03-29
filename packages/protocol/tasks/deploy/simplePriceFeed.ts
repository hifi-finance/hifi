import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { SimplePriceFeed } from "../../src/types/contracts/oracles/SimplePriceFeed";
import { SimplePriceFeed__factory } from "../../src/types/factories/contracts/oracles/SimplePriceFeed__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_SIMPLE_PRICE_FEED } from "../constants";

task(TASK_DEPLOY_CONTRACT_SIMPLE_PRICE_FEED)
  // Contract arguments
  .addParam("description", "Description of the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const simplePriceFeedFactory: SimplePriceFeed__factory = new SimplePriceFeed__factory(signers[0]);
    const simplePriceFeed: SimplePriceFeed = <SimplePriceFeed>await simplePriceFeedFactory.deploy(taskArgs.description);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: simplePriceFeed,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "SimplePriceFeed", address: simplePriceFeed.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: simplePriceFeed.address,
          constructorArguments: [taskArgs.description],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return simplePriceFeed.address;
  });
