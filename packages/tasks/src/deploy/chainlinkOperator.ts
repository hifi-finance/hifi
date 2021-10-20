import * as core from "@actions/core";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/ChainlinkOperator";
import { ChainlinkOperator__factory } from "@hifi/protocol/dist/types/factories/ChainlinkOperator__factory";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_CHAINLINK_OPERATOR,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_CHAINLINK_OPERATOR)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const chainlinkOperatorFactory: ChainlinkOperator__factory = new ChainlinkOperator__factory(signers[0]);
    const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>await chainlinkOperatorFactory.deploy();

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: chainlinkOperator,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("chainlink-operator", chainlinkOperator.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "ChainlinkOperator", address: chainlinkOperator.address }]);
    }

    return chainlinkOperator.address;
  });
