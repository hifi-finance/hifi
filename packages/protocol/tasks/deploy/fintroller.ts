import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { FintrollerV1, FintrollerV1__factory } from "../../typechain";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS } from "../constants";

task("deploy:Fintroller")
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run, upgrades }) {
    const fintrollerV1Factory: FintrollerV1__factory = await ethers.getContractFactory("FintrollerV1");
    const fintroller: FintrollerV1 = <FintrollerV1>await upgrades.deployProxy(fintrollerV1Factory);

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, { contract: fintroller, confirmations: taskArgs.confirmations });

    if (taskArgs.setOutput) {
      core.setOutput("fintroller", fintroller.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "Fintroller", address: fintroller.address }]);
    }

    return fintroller.address;
  });
