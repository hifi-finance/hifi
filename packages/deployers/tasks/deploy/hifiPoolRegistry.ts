import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { HifiPoolRegistry__factory } from "@hifi/amm/typechain/factories/HifiPoolRegistry__factory";
import { HifiPoolRegistry } from "@hifi/amm/typechain/HifiPoolRegistry";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TASK_DEPLOY_HIFI_POOL_REGISTRY } from "../constants";

task(TASK_DEPLOY_HIFI_POOL_REGISTRY).setAction(async function (_: TaskArguments, { ethers }): Promise<string> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const hifiPoolRegistryFactory: HifiPoolRegistry__factory = new HifiPoolRegistry__factory(signers[0]);
  const hifiPoolRegistry: HifiPoolRegistry = <HifiPoolRegistry>await hifiPoolRegistryFactory.deploy();
  await hifiPoolRegistry.deployed();
  return hifiPoolRegistry.address;
});
