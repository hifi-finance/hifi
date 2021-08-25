import * as core from "@actions/core";
import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { hexStripZeros } from "@ethersproject/bytes";
import { BalanceSheetV1, BalanceSheetV1__factory } from "../../typechain";
import {
  ERC1967_IMPLEMENTATION_STORAGE_SLOT,
  SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS,
  TASK_DEPLOY_CONTRACT_BALANCE_SHEET,
} from "../../helpers/constants";

task(TASK_DEPLOY_CONTRACT_BALANCE_SHEET)
  // Contract arguments
  .addParam("fintroller", "The address of the Fintroller contract")
  .addParam("oracle", "The address of the oracle contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 0, types.int)
  .addOptionalParam("printAddress", "Print the address in the console", true, types.boolean)
  .addOptionalParam("setOutput", "Set the contract address as an output in GitHub Actions", false, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, run, upgrades }) {
    const balanceSheetV1Factory: BalanceSheetV1__factory = await ethers.getContractFactory("BalanceSheetV1");
    const balanceSheetProxy: BalanceSheetV1 = <BalanceSheetV1>(
      await upgrades.deployProxy(balanceSheetV1Factory, [taskArgs.fintroller, taskArgs.oracle])
    );

    await run(SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, {
      contract: balanceSheetProxy,
      confirmations: taskArgs.confirmations,
    });

    const balanceSheetImplementation: string = hexStripZeros(
      await ethers.provider.getStorageAt(balanceSheetProxy.address, ERC1967_IMPLEMENTATION_STORAGE_SLOT),
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