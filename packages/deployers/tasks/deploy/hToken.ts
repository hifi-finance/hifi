import * as core from "@actions/core";

import {
  DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS,
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_H_TOKEN,
} from "../../helpers/constants";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { HToken__factory } from "@hifi/protocol/typechain/factories/HToken__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_H_TOKEN)
  // Contract arguments
  .addParam("name", "ERC-20 name of the hToken")
  .addParam("symbol", "ERC-20 symbol of the hToken")
  .addParam("maturity", "Unix timestamp for when the hToken matures")
  .addParam("balanceSheet", "Address of the BalanceSheet contract")
  .addParam("underlying", "Address of the underlying ERC-20 contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hTokenFactory: HToken__factory = new HToken__factory(signers[0]);

    const deploymentTx: TransactionRequest = hTokenFactory.getDeployTransaction(
      taskArgs.name,
      taskArgs.symbol,
      taskArgs.maturity,
      taskArgs.balanceSheet,
      taskArgs.underlying,
    );
    deploymentTx.to = DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS;
    const contractAddress: string = await signers[0].call(deploymentTx);
    const txResponse: TransactionResponse = await signers[0].sendTransaction(deploymentTx);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      factory: hTokenFactory,
      confirmations: taskArgs.confirmations,
      txResponse: txResponse,
    });

    if (taskArgs.setOutput) {
      core.setOutput("h-token", contractAddress);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HToken", address: contractAddress }]);
    }
    return contractAddress;
  });
