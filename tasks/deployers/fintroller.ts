import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { FintrollerV1, FintrollerV1__factory } from "../../typechain";

task("deploy:Fintroller").setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
  const fintrollerV1Factory: FintrollerV1__factory = await ethers.getContractFactory("FintrollerV1");
  const fintroller: FintrollerV1 = <FintrollerV1>await upgrades.deployProxy(fintrollerV1Factory);
  await fintroller.deployed();
  console.log("Fintroller deployed to: ", fintroller.address);
});
