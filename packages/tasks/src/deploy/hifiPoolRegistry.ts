import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HifiPoolRegistry__factory } from "@hifi/amm/dist/types/factories/HifiPoolRegistry__factory";
import type { HifiPoolRegistry } from "@hifi/amm/dist/types/HifiPoolRegistry";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_HIFI_POOL_REGISTRY,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_HIFI_POOL_REGISTRY)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run }): Promise<string> {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const hifiPoolRegistryFactory: HifiPoolRegistry__factory = new HifiPoolRegistry__factory(signers[0]);
    const hifiPoolRegistry: HifiPoolRegistry = <HifiPoolRegistry>await hifiPoolRegistryFactory.deploy();

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: hifiPoolRegistry,
      confirmations: taskArgs.confirmations,
    });

    if (taskArgs.setOutput) {
      core.setOutput("hifi-pool-registry", hifiPoolRegistry.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "HifiPoolRegistry", address: hifiPoolRegistry.address }]);
    }

    return hifiPoolRegistry.address;
  });
