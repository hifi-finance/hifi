import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { ChainlinkOperator__factory } from "@hifi/protocol/typechain/factories/ChainlinkOperator__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { TASK_DEPLOY_CHAINLINK_OPERATOR } from "../constants";

task(TASK_DEPLOY_CHAINLINK_OPERATOR)
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const chainlinkOperatorFactory: ChainlinkOperator__factory = new ChainlinkOperator__factory(signers[0]);
    const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>await chainlinkOperatorFactory.deploy();
    await chainlinkOperator.deployed();
    if (taskArgs.printAddress) {
      console.table([{ name: "ChainlinkOperator", address: chainlinkOperator.address }]);
    }
    return chainlinkOperator.address;
  });
