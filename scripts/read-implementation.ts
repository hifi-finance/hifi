import { ethers } from "hardhat";

import { getEnvVar } from "../helpers/env";

const proxyAddress: string = getEnvVar("PROXY_ADDRESS");

async function main(): Promise<void> {
  // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.1.0/contracts/proxy/transparent/TransparentUpgradeableProxy.sol#L62-L73
  const implementationAddress: string = await ethers.provider.getStorageAt(
    proxyAddress,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
  );
  console.log({ implementationAddress });
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
