import * as core from "@actions/core";

import {
  DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS,
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_STABLECOIN_PRICE_FEED,
} from "../../helpers/constants";
import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StablecoinPriceFeed__factory } from "@hifi/protocol/typechain/factories/StablecoinPriceFeed__factory";
import { TaskArguments } from "hardhat/types";

task(TASK_DEPLOY_CONTRACT_STABLECOIN_PRICE_FEED)
  // Contract arguments
  .addParam("price", "Immutable price of the stablecoin, with 8 decimals of precision")
  .addParam("description", "Description of the price feed")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const stablecoinPriceFeedFactory: StablecoinPriceFeed__factory = new StablecoinPriceFeed__factory(signers[0]);

    const deploymentTx: TransactionRequest = stablecoinPriceFeedFactory.getDeployTransaction(
      taskArgs.price,
      taskArgs.description,
    );
    deploymentTx.to = DETERMINISTIC_DEPLOYMENT_PROXY_ADDRESS;
    const contractAddress: string = await signers[0].call(deploymentTx);
    const txResponse: TransactionResponse = await signers[0].sendTransaction(deploymentTx);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      factory: stablecoinPriceFeedFactory,
      confirmations: taskArgs.confirmations,
      txResponse: txResponse,
    });

    if (taskArgs.setOutput) {
      core.setOutput("stablecoin-price-feed", contractAddress);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "StablecoinPriceFeed", address: contractAddress }]);
    }
    return contractAddress;
  });
