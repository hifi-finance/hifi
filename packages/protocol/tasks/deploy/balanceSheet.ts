import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { BalanceSheetV2 } from "../../src/types/BalanceSheetV2";
import { BalanceSheetV2__factory } from "../../src/types/factories/BalanceSheetV2__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_BALANCE_SHEET } from "../constants";

task(TASK_DEPLOY_CONTRACT_BALANCE_SHEET)
  // Contract arguments
  .addParam("fintroller", "The address of the Fintroller contract")
  .addParam("oracle", "The address of the oracle contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run, upgrades }) {
    const balanceSheetV2Factory: BalanceSheetV2__factory = <BalanceSheetV2__factory>(
      await ethers.getContractFactory("BalanceSheetV2")
    );
    const balanceSheetProxy: BalanceSheetV2 = <BalanceSheetV2>(
      await upgrades.deployProxy(balanceSheetV2Factory, [taskArgs.fintroller, taskArgs.oracle])
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: balanceSheetProxy,
      confirmations: taskArgs.confirmations,
    });

    const balanceSheetImplementation: string = await upgrades.erc1967.getImplementationAddress(
      balanceSheetProxy.address,
    );
    if (taskArgs.setOutput) {
      core.setOutput("balance-sheet-proxy", balanceSheetProxy.address);
      core.setOutput("balance-sheet-implementation", balanceSheetImplementation);
    }
    if (taskArgs.printAddress) {
      console.table([
        { name: "BalanceSheet:Proxy", address: balanceSheetProxy.address },
        { name: "BalanceSheet:Implementation", address: balanceSheetImplementation },
      ]);
    }

    return {
      proxy: balanceSheetProxy.address,
      implementation: balanceSheetImplementation,
    };
  });
