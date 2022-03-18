import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { BalanceSheetV2__factory } from "../../src/types/factories/BalanceSheetV2__factory";
import { TASK_PREPARE_UPGRADE_BALANCE_SHEET } from "../constants";

task(TASK_PREPARE_UPGRADE_BALANCE_SHEET)
  // Contract arguments
  .addParam("proxy", "The address of the existing proxy contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run, upgrades }) {
    const balanceSheetV2Factory: BalanceSheetV2__factory = <BalanceSheetV2__factory>(
      await ethers.getContractFactory("BalanceSheetV2")
    );
    const balanceSheetV2Address: string = await upgrades.prepareUpgrade(taskArgs.proxy, balanceSheetV2Factory);

    if (taskArgs.print) {
      console.table([{ name: "BalanceSheetV2", address: balanceSheetV2Address }]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: balanceSheetV2Address,
          constructorArguments: [],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    return {
      balanceSheetV2: balanceSheetV2Address,
    };
  });
