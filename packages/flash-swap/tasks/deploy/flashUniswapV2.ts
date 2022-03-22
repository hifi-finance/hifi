import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { FlashUniswapV2 } from "../../src/types/FlashUniswapV2";
import { FlashUniswapV2__factory } from "../../src/types/factories/FlashUniswapV2__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_FLASH_UNISWAP_V2 } from "../constants";

task(TASK_DEPLOY_CONTRACT_FLASH_UNISWAP_V2)
  // Contract arguments
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("uniV2Factory", "Address of the UniswapV2Factory contract")
  .addParam("uniV2PairInitCodeHash", "Init code hash of the UniswapV2Pair contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const flashUniswapV2Factory: FlashUniswapV2__factory = new FlashUniswapV2__factory(signers[0]);
    const flashUniswapV2: FlashUniswapV2 = <FlashUniswapV2>(
      await flashUniswapV2Factory.deploy(taskArgs.balanceSheet, taskArgs.uniV2Factory, taskArgs.uniV2PairInitCodeHash)
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: flashUniswapV2,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "FlashUniswapV2", address: flashUniswapV2.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: flashUniswapV2.address,
          constructorArguments: [taskArgs.balanceSheet, taskArgs.uniV2Factory, taskArgs.uniV2PairInitCodeHash],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return flashUniswapV2.address;
  });
