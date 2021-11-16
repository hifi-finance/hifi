import * as core from "@actions/core";
import type { FlashUniswapV2 } from "@hifi/flash-swap/dist/types/FlashUniswapV2";
import { FlashUniswapV2__factory } from "@hifi/flash-swap/dist/types/factories/FlashUniswapV2__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_FLASH_UNISWAP_V2 } from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_FLASH_UNISWAP_V2)
  // Contract arguments
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("uniV2Factory", "Address of the UniswapV2Factory contract")
  .addParam("uniV2PairInitCodeHash", "Init code hash of the UniswapV2Pair contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
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

    if (taskArgs.setOutput) {
      core.setOutput("flash-uniswap-v2", flashUniswapV2.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "FlashUniswapV2", address: flashUniswapV2.address }]);
    }

    return flashUniswapV2.address;
  });
