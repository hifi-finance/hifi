import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { FintrollerV1 } from "../../src/types/FintrollerV1";
import { FintrollerV1__factory } from "../../src/types/factories/FintrollerV1__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_FINTROLLER } from "../constants";

task(TASK_DEPLOY_CONTRACT_FINTROLLER)
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run, upgrades }) {
    const fintrollerV1Factory: FintrollerV1__factory = <FintrollerV1__factory>(
      await ethers.getContractFactory("FintrollerV1")
    );
    const fintrollerProxy: FintrollerV1 = <FintrollerV1>await upgrades.deployProxy(fintrollerV1Factory);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: fintrollerProxy,
      confirmations: taskArgs.confirmations,
    });

    const fintrollerImplementation: string = await upgrades.erc1967.getImplementationAddress(fintrollerProxy.address);
    if (taskArgs.setOutput) {
      core.setOutput("fintroller-proxy", fintrollerProxy.address);
      core.setOutput("fintroller-implementation", fintrollerImplementation);
    }
    if (taskArgs.printAddress) {
      console.table([
        { name: "Fintroller:Proxy", address: fintrollerProxy.address },
        { name: "Fintroller:Implementation", address: fintrollerImplementation },
      ]);
    }

    return {
      proxy: fintrollerProxy.address,
      implementation: fintrollerImplementation,
    };
  });
