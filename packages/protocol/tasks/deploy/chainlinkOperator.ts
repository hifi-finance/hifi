import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { ChainlinkOperator } from "../../src/types/contracts/oracles/ChainlinkOperator";
import { ChainlinkOperator__factory } from "../../src/types/factories/contracts/oracles/ChainlinkOperator__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_CHAINLINK_OPERATOR } from "../constants";

task(TASK_DEPLOY_CONTRACT_CHAINLINK_OPERATOR)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("newOwner", "The address of new owner to set the deployed contract to", null, types.string)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const chainlinkOperatorFactory: ChainlinkOperator__factory = new ChainlinkOperator__factory(signers[0]);
    const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>await chainlinkOperatorFactory.deploy();

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: chainlinkOperator,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.print) {
      console.table([{ name: "ChainlinkOperator", address: chainlinkOperator.address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: chainlinkOperator.address,
          constructorArguments: [],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    if (taskArgs.newOwner) {
      try {
        await chainlinkOperator._transferOwnership(taskArgs.newOwner);
      } catch (error) {
        console.error("Error while transferring ownership:", error);
      }
    }

    return chainlinkOperator.address;
  });
