import { ethers } from "hardhat";

import { HifiProxyTarget, HifiProxyTarget__factory } from "../../typechain";

async function main(): Promise<void> {
  const hifiProxyTargetFactory: HifiProxyTarget__factory = await ethers.getContractFactory("HifiProxyTarget");
  const hifiProxyTarget: HifiProxyTarget = await hifiProxyTargetFactory.deploy();
  await hifiProxyTarget.deployed();
  console.log("HiFiProxyTarget deployed to: ", hifiProxyTarget.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
