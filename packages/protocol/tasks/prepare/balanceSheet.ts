import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { BalanceSheetV2__factory } from "../../src/types/factories/BalanceSheetV2__factory";
import { TASK_PREPARE_UPGRADE_BALANCE_SHEET } from "../constants";

task(TASK_PREPARE_UPGRADE_BALANCE_SHEET)
  // Contract arguments
  .addParam("proxy", "The address of the existing proxy contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, upgrades }) {
    const balanceSheetV2Factory: BalanceSheetV2__factory = <BalanceSheetV2__factory>(
      await ethers.getContractFactory("BalanceSheetV2")
    );
    const balanceSheetV2: string = await upgrades.prepareUpgrade(taskArgs.proxy, balanceSheetV2Factory);

    if (taskArgs.setOutput) {
      core.setOutput("balance-sheet-v2", balanceSheetV2);
    }
    if (taskArgs.printAddress) {
      console.table([{ name: "BalanceSheetV2", address: balanceSheetV2 }]);
    }

    return {
      balanceSheetV2: balanceSheetV2,
    };
  });
