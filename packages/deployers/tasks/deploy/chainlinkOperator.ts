import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { ChainlinkOperator__factory } from "@hifi/protocol/typechain/factories/ChainlinkOperator__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import { TASK_DEPLOY_CHAINLINK_OPERATOR } from "../constants";

task(TASK_DEPLOY_CHAINLINK_OPERATOR).setAction(async function (_, { ethers }): Promise<string> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const chainlinkOperatorFactory: ChainlinkOperator__factory = new ChainlinkOperator__factory(signers[0]);
  const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>await chainlinkOperatorFactory.deploy();
  await chainlinkOperator.deployed();
  return chainlinkOperator.address;
});
