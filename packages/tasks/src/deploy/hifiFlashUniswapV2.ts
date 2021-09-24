import * as core from "@actions/core";
import { HifiFlashUniswapV2 } from "@hifi/flash-swap/typechain/HifiFlashUniswapV2";
import { HifiFlashUniswapV2__factory } from "@hifi/flash-swap/typechain/factories/HifiFlashUniswapV2__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_HIFI_FLASH_UNISWAP_V2,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_HIFI_FLASH_UNISWAP_V2)
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
    const hifiFlashUniswapV2Factory: HifiFlashUniswapV2__factory = new HifiFlashUniswapV2__factory(signers[0]);
    const hifiFlashUniswapV2: HifiFlashUniswapV2 = <HifiFlashUniswapV2>(
      await hifiFlashUniswapV2Factory.deploy(
        taskArgs.balanceSheet,
        taskArgs.uniV2Factory,
        taskArgs.uniV2PairInitCodeHash,
      )
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: hifiFlashUniswapV2,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-flash-uniswap-v2", hifiFlashUniswapV2.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiFlashUniswapV2", address: hifiFlashUniswapV2.address }]);
    }

    return hifiFlashUniswapV2.address;
  });