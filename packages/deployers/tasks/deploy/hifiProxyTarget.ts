import * as core from "@actions/core";

import {
  DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS,
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET,
} from "../../helpers/constants";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { HifiProxyTarget__factory } from "@hifi/proxy-target/typechain/factories/HifiProxyTarget__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_HIFI_PROXY_TARGET)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiProxyTargetFactory: HifiProxyTarget__factory = new HifiProxyTarget__factory(signers[0]);
    const deploymentTx: TransactionRequest = hifiProxyTargetFactory.getDeployTransaction();
    deploymentTx.to = DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS;
    const contractAddress: string = await signers[0].call(deploymentTx);
    const txResponse: TransactionResponse = await signers[0].sendTransaction(deploymentTx);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      factory: hifiProxyTargetFactory,
      confirmations: taskArgs.confirmations,
      txResponse: txResponse,
    });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-proxy-target", contractAddress);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiProxyTarget", address: contractAddress }]);
    }

    return contractAddress;
  });
