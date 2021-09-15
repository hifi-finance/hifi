import * as core from "@actions/core";

import {
  DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS,
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_SIMPLE_PRICE_FEED,
} from "../../helpers/constants";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SimplePriceFeed__factory } from "@hifi/protocol/typechain/factories/SimplePriceFeed__factory";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_SIMPLE_PRICE_FEED)
  // Contract arguments
  .addParam("description", "Description of the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const simplePriceFeedFactory: SimplePriceFeed__factory = new SimplePriceFeed__factory(signers[0]);
    const deploymentTx: TransactionRequest = simplePriceFeedFactory.getDeployTransaction(taskArgs.description);
    deploymentTx.to = DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS;
    const contractAddress: string = await signers[0].call(deploymentTx);
    const txResponse: TransactionResponse = await signers[0].sendTransaction(deploymentTx);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      factory: simplePriceFeedFactory,
      confirmations: taskArgs.confirmations,
      txResponse: txResponse,
    });

    if (taskArgs.setOutput) {
      core.setOutput("simple-price-feed", contractAddress);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "SimplePriceFeed", address: contractAddress }]);
    }

    return contractAddress;
  });
