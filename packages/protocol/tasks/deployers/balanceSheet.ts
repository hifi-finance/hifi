import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { BalanceSheetV1, BalanceSheetV1__factory } from "../../typechain";

task("deploy:BalanceSheet")
  .addParam("fintroller", "The address of the Fintroller contract")
  .addParam("oracle", "The address of the oracle contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const balanceSheetV1Factory: BalanceSheetV1__factory = await ethers.getContractFactory("BalanceSheetV1");
    const balanceSheet: BalanceSheetV1 = <BalanceSheetV1>(
      await upgrades.deployProxy(balanceSheetV1Factory, [taskArguments.fintroller, taskArguments.oracle])
    );
    await balanceSheet.deployed();
    console.log("BalanceSheet deployed to: ", balanceSheet.address);
  });
