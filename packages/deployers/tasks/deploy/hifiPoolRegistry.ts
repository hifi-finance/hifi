import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { HifiPoolRegistry__factory } from "@hifi/amm/typechain/factories/HifiPoolRegistry__factory";
import { HifiPoolRegistry } from "@hifi/amm/typechain/HifiPoolRegistry";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TASK_DEPLOY_HIFI_POOL_REGISTRY } from "../constants";

task(TASK_DEPLOY_HIFI_POOL_REGISTRY)
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiPoolRegistryFactory: HifiPoolRegistry__factory = new HifiPoolRegistry__factory(signers[0]);
    const hifiPoolRegistry: HifiPoolRegistry = <HifiPoolRegistry>await hifiPoolRegistryFactory.deploy();
    await hifiPoolRegistry.deployed();
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiPoolRegistry", address: hifiPoolRegistry.address }]);
    }
    return hifiPoolRegistry.address;
  });
