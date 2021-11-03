import * as core from "@actions/core";
import type { HifiFlashUniswapV2Underlying } from "@hifi/flash-swap/dist/types/HifiFlashUniswapV2Underlying";
import { HifiFlashUniswapV2Underlying__factory } from "@hifi/flash-swap/dist/types/factories/HifiFlashUniswapV2Underlying__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_HIFI_FLASH_UNISWAP_V2_UNDERLYING,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_HIFI_FLASH_UNISWAP_V2_UNDERLYING)
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
    const hifiFlashUniswapV2UnderlyingFactory: HifiFlashUniswapV2Underlying__factory =
      new HifiFlashUniswapV2Underlying__factory(signers[0]);
    const hifiFlashUniswapV2Underlying: HifiFlashUniswapV2Underlying = <HifiFlashUniswapV2Underlying>(
      await hifiFlashUniswapV2UnderlyingFactory.deploy(
        taskArgs.balanceSheet,
        taskArgs.uniV2Factory,
        taskArgs.uniV2PairInitCodeHash,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: hifiFlashUniswapV2Underlying,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-flash-uniswap-v2-underlying", hifiFlashUniswapV2Underlying.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiFlashUniswapV2Underlying", address: hifiFlashUniswapV2Underlying.address }]);
    }

    return hifiFlashUniswapV2Underlying.address;
  });
