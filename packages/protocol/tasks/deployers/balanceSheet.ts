import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { BalanceSheetV1, BalanceSheetV1__factory } from "../../typechain";

task("deploy:BalanceSheet")
  .addParam("fintroller", "The address of the Fintroller contract")
  .addParam("oracle", "The address of the oracle contract")
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, upgrades }): Promise<string> {
    const balanceSheetV1Factory: BalanceSheetV1__factory = await ethers.getContractFactory("BalanceSheetV1");
    const balanceSheet: BalanceSheetV1 = <BalanceSheetV1>(
      await upgrades.deployProxy(balanceSheetV1Factory, [taskArgs.fintroller, taskArgs.oracle])
    );
    await balanceSheet.deployed();
    if (taskArgs.printAddress) {
      console.table([{ name: "BalanceSheet", address: balanceSheet.address }]);
    }
    return balanceSheet.address;
  });
