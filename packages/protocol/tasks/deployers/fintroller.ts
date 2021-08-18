import { task, types } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { FintrollerV1, FintrollerV1__factory } from "../../typechain";

task("deploy:Fintroller")
  .addOptionalParam("printAddress", "Whether to print the address in the console", true, types.boolean)
  .setAction(async function (taskArgs: TaskArguments, { ethers, upgrades }) {
    const fintrollerV1Factory: FintrollerV1__factory = await ethers.getContractFactory("FintrollerV1");
    const fintroller: FintrollerV1 = <FintrollerV1>await upgrades.deployProxy(fintrollerV1Factory);
    await fintroller.deployed();
    if (taskArgs.printAddress) {
      console.table([{ name: "Fintroller", address: fintroller.address }]);
    }
    return fintroller.address;
  });
