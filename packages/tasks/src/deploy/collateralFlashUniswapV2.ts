import * as core from "@actions/core";
import type { CollateralFlashUniswapV2 } from "@hifi/flash-swap/dist/types/CollateralFlashUniswapV2";
import { CollateralFlashUniswapV2__factory } from "@hifi/flash-swap/dist/types/factories/CollateralFlashUniswapV2__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_COLLATERAL_FLASH_UNISWAP_V2,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_COLLATERAL_FLASH_UNISWAP_V2)
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
    const collateralFlashUniswapV2Factory: CollateralFlashUniswapV2__factory = new CollateralFlashUniswapV2__factory(
      signers[0],
    );
    const collateralFlashUniswapV2: CollateralFlashUniswapV2 = <CollateralFlashUniswapV2>(
      await collateralFlashUniswapV2Factory.deploy(
        taskArgs.balanceSheet,
        taskArgs.uniV2Factory,
        taskArgs.uniV2PairInitCodeHash,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: collateralFlashUniswapV2,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("collateral-flash-uniswap-v2", collateralFlashUniswapV2.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "CollateralFlashUniswapV2", address: collateralFlashUniswapV2.address }]);
    }

    return collateralFlashUniswapV2.address;
  });
