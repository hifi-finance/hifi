import { subtask, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS } from "../constants";

subtask(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS)
  .addParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addParam("contract", "Contract whose deployment to wait for", undefined, types.any)
  .setAction(async function (taskArgs: TaskArguments): Promise<void> {
    if (taskArgs.confirmations === 0) {
      await taskArgs.contract.deployed();
    } else if (taskArgs.contract.deployTransaction) {
      await taskArgs.contract.deployTransaction.wait(taskArgs.confirmations);
    }
  });
