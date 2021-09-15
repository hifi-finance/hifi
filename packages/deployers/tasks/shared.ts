import { subtask, types } from "hardhat/config";

import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS } from "../helpers/constants";
import { TaskArguments } from "hardhat/types";

subtask(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS)
  .addParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addParam("factory", "Contract factory whose deployment to wait for", undefined, types.any)
  .setAction(async function (taskArgs: TaskArguments): Promise<void> {
    if (taskArgs.confirmations === 0) {
      await taskArgs.txResponse.wait();
    } else if (taskArgs.factory.deployTransaction) {
      await taskArgs.txResponse.wait(taskArgs.confirmations);
    }
  });
