import { HifiFlashUniswapV2 } from "@hifi/flash-swap/typechain/HifiFlashUniswapV2";
import { HifiFlashUniswapV2__factory } from "@hifi/flash-swap/typechain/factories/HifiFlashUniswapV2__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { TASK_DEPLOY_HIFI_FLASH_UNISWAP_V2 } from "../constants";

task(TASK_DEPLOY_HIFI_FLASH_UNISWAP_V2)
  .addParam("balanceSheet", "The address of the BalanceSheet contract")
  .addParam("pair0", "The address of an Uniswap V2 pair contract")
  .addOptionalParam("pair1", "The address of an Uniswap V2 pair contract")
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiFlashUniswapV2Factory: HifiFlashUniswapV2__factory = new HifiFlashUniswapV2__factory(signers[0]);
    const pairs: string[] = [taskArgs.pair0];
    if (taskArgs.pair1) {
      pairs.push(taskArgs.pair1);
    }
    const hifiFlashUniswapV2: HifiFlashUniswapV2 = <HifiFlashUniswapV2>(
      await hifiFlashUniswapV2Factory.deploy(taskArgs.balanceSheet, pairs)
    );
    await hifiFlashUniswapV2.deployed();
    return hifiFlashUniswapV2.address;
  });
