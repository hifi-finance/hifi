import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { BalanceSheetV1, BalanceSheetV1__factory } from "../../typechain";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS } from "../constants";

task("deploy:BalanceSheet")
  // Contract arguments
  .addParam("fintroller", "The address of the Fintroller contract")
  .addParam("oracle", "The address of the oracle contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run, upgrades }): Promise<string> {
    const balanceSheetV1Factory: BalanceSheetV1__factory = await ethers.getContractFactory("BalanceSheetV1");
    const balanceSheet: BalanceSheetV1 = <BalanceSheetV1>(
      await upgrades.deployProxy(balanceSheetV1Factory, [taskArgs.fintroller, taskArgs.oracle])
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, { contract: balanceSheet, confirmations: taskArgs.confirmations });

    if (taskArgs.setOutput) {
      core.setOutput("balance-sheet", balanceSheet.address);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "BalanceSheet", address: balanceSheet.address }]);
    }

    return balanceSheet.address;
  });
