import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { BalanceSheetV2 } from "../../src/types/contracts/core/balance-sheet/BalanceSheetV2";
import { BalanceSheetV2__factory } from "../../src/types/factories/contracts/core/balance-sheet/BalanceSheetV2__factory";
import { SUBTASK_DEPLOY_WAIT_FOR_CONFIRMATIONS, TASK_DEPLOY_CONTRACT_BALANCE_SHEET } from "../constants";

task(TASK_DEPLOY_CONTRACT_BALANCE_SHEET)
  // Contract arguments
  .addParam("fintroller", "The address of the Fintroller contract")
  .addParam("oracle", "The address of the oracle contract")
  // Developer settings
  .addOptionalParam("confirmations", "How many block confirmations to wait for", 2, types.int)
  .addOptionalParam("newOwner", "The address of new owner to set the deployed contract to", "", types.string)
  .addOptionalParam("print", "Print the address in the console", true, types.boolean)
  .addOptionalParam("verify", "Verify the contract on Etherscan", true, types.boolean)
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
    if (taskArgs.print) {
      console.table([
        { name: "BalanceSheet:Proxy", address: balanceSheetProxy.address },
        { name: "BalanceSheet:Implementation", address: balanceSheetImplementation },
      ]);
    }

    if (taskArgs.verify) {
      try {
        await run("verify:verify", {
          address: balanceSheetImplementation,
          constructorArgs: [],
        });
      } catch (error) {
        console.error("Error while verifying contract:", error);
      }
    }

    if (taskArgs.newOwner) {
      try {
        await balanceSheetProxy._transferOwnership(taskArgs.newOwner);
      } catch (error) {
        console.error("Error while transferring ownership:", error);
      }
    }

    return {
      proxy: balanceSheetProxy.address,
      implementation: balanceSheetImplementation,
    };
  });
