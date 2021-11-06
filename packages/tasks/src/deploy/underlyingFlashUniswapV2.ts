import * as core from "@actions/core";
import type { UnderlyingFlashUniswapV2 } from "@hifi/flash-swap/dist/types/UnderlyingFlashUniswapV2";
import { UnderlyingFlashUniswapV2__factory } from "@hifi/flash-swap/dist/types/factories/UnderlyingFlashUniswapV2__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_UNDERLYING_FLASH_UNISWAP_V2,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_UNDERLYING_FLASH_UNISWAP_V2)
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
    const underlyingFlashUniswapV2Factory: UnderlyingFlashUniswapV2__factory = new UnderlyingFlashUniswapV2__factory(
      signers[0],
    );
    const underlyingFlashUniswapV2: UnderlyingFlashUniswapV2 = <UnderlyingFlashUniswapV2>(
      await underlyingFlashUniswapV2Factory.deploy(
        taskArgs.balanceSheet,
        taskArgs.uniV2Factory,
        taskArgs.uniV2PairInitCodeHash,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: underlyingFlashUniswapV2,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("underlying-flash-uniswap-v2", underlyingFlashUniswapV2.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "UnderlyingFlashUniswapV2", address: underlyingFlashUniswapV2.address }]);
    }

    return underlyingFlashUniswapV2.address;
  });
