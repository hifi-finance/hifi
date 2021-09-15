import * as core from "@actions/core";

import {
  DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS,
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_HIFI_FLASH_UNISWAP_V2,
} from "../../helpers/constants";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { HifiFlashUniswapV2__factory } from "@hifi/flash-swap/typechain/factories/HifiFlashUniswapV2__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_HIFI_FLASH_UNISWAP_V2)
  // Contract arguments
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("pair0", "Address of an Uniswap V2 pair contract")
  .addOptionalParam("pair1", "Address of an Uniswap V2 pair contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiFlashUniswapV2Factory: HifiFlashUniswapV2__factory = new HifiFlashUniswapV2__factory(signers[0]);
    const pairs: string[] = [taskArgs.pair0];
    if (taskArgs.pair1) {
      pairs.push(taskArgs.pair1);
    }
    const deploymentTx: TransactionRequest = hifiFlashUniswapV2Factory.getDeployTransaction(
      taskArgs.balanceSheet,
      pairs,
    );
    deploymentTx.to = DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS;
    const contractAddress: string = await signers[0].call(deploymentTx);
    const txResponse: TransactionResponse = await signers[0].sendTransaction(deploymentTx);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      factory: hifiFlashUniswapV2Factory,
      confirmations: taskArgs.confirmations,
      txResponse: txResponse,
    });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-flash-uniswap-v2", contractAddress);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiFlashUniswapV2", address: contractAddress }]);
    }

    return contractAddress;
  });
