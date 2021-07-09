import { ethers } from "hardhat";

import { HiFiProxyTarget, HiFiProxyTarget__factory } from "../../typechain";

async function main(): Promise<void> {
  const hiFiProxyTargetFactory: HiFiProxyTarget__factory = await ethers.getContractFactory("RegentsTargetV1");
  const hiFiProxyTarget: HiFiProxyTarget = await hiFiProxyTargetFactory.deploy();
  await hiFiProxyTarget.deployed();
  console.log("HiFiProxyTarget deployed to: ", hiFiProxyTarget.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
