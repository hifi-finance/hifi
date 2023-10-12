import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { UniswapV3PriceFeed } from "../../src/types/contracts/oracles/UniswapV3PriceFeed";
import { UniswapV3PriceFeed__factory } from "../../src/types/factories/contracts/oracles/UniswapV3PriceFeed__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_UNISWAP_V3_PRICE_FEED } from "../constants";

task(TASK_DEPLOY_CONTRACT_UNISWAP_V3_PRICE_FEED)
  // Contract arguments
  .addParam("pool", "Address of the Uniswap V3 pool")
  .addParam("quoteAsset", "Address of the quote asset for price calculation")
  .addParam("twapInterval", "The time interval for TWAP calculation")
  .addParam("maxPrice", "The maximum price for the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const uniswapV3PriceFeedFactory: UniswapV3PriceFeed__factory = new UniswapV3PriceFeed__factory(signers[0]);
    const uniswapV3PriceFeed: UniswapV3PriceFeed = <UniswapV3PriceFeed>(
      await uniswapV3PriceFeedFactory.deploy(
        taskArgs.pool,
        taskArgs.quoteAsset,
        taskArgs.twapInterval,
        taskArgs.maxPrice,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: uniswapV3PriceFeed,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "UniswapV3PriceFeed", address: uniswapV3PriceFeed.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: uniswapV3PriceFeed.address,
          constructorArguments: [taskArgs.pool, taskArgs.quoteAsset, taskArgs.twapInterval],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return uniswapV3PriceFeed.address;
  });
