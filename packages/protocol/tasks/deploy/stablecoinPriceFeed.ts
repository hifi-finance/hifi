import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { StablecoinPriceFeed } from "../../src/types/StablecoinPriceFeed";
import { StablecoinPriceFeed__factory } from "../../src/types/factories/StablecoinPriceFeed__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_STABLECOIN_PRICE_FEED } from "../constants";

task(TASK_DEPLOY_CONTRACT_STABLECOIN_PRICE_FEED)
  // Contract arguments
  .addParam("price", "Immutable price of the stablecoin, with 8 decimals of precision")
  .addParam("description", "Description of the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
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

    if (taskArgs.print) {
      console.table([{ name: "StablecoinPriceFeed", address: stablecoinPriceFeed.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: stablecoinPriceFeed.address,
          constructorArguments: [taskArgs.price, taskArgs.description],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return stablecoinPriceFeed.address;
  });
