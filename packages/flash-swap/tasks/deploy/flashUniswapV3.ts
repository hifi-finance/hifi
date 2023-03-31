import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { FlashUniswapV3 } from "../../src/types/contracts/uniswap-v3/FlashUniswapV3";
import { FlashUniswapV3__factory } from "../../src/types/factories/contracts/uniswap-v3/FlashUniswapV3__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_FLASH_UNISWAP_V3 } from "../constants";

task(TASK_DEPLOY_CONTRACT_FLASH_UNISWAP_V3)
  // Contract arguments
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("uniV3Factory", "Address of the Uniswap V3 Factory contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const flashUniswapV3Factory: FlashUniswapV3__factory = new FlashUniswapV3__factory(signers[0]);
    const flashUniswapV3: FlashUniswapV3 = <FlashUniswapV3>(
      await flashUniswapV3Factory.deploy(taskArgs.balanceSheet, taskArgs.uniV3Factory)
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: flashUniswapV3,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "FlashUniswapV3", address: flashUniswapV3.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: flashUniswapV3.address,
          constructorArguments: [taskArgs.balanceSheet, taskArgs.uniV3Factory],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return flashUniswapV3.address;
  });
