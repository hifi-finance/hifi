import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

let balancerExchangeProxyAddress: string;
if (!process.env.BALANCER_EXCHANGE_PROXY_ADDRESS) {
  throw new Error("Please set BALANCER_EXCHANGE_PROXY_ADDRESS as an env variable");
} else {
  balancerExchangeProxyAddress = process.env.BALANCER_EXCHANGE_PROXY_ADDRESS;
}

let wethAddress: string;
if (!process.env.WETH_ADDRESS) {
  throw new Error("Please set WETH_ADDRESS as an env variable");
} else {
  wethAddress = process.env.WETH_ADDRESS;
}

async function main(): Promise<void> {
  const batterseaScriptsV1Factory: ContractFactory = await ethers.getContractFactory("BatterseaScriptsV1");
  const batterseaScriptsV1: Contract = await batterseaScriptsV1Factory.deploy(
    balancerExchangeProxyAddress,
    wethAddress,
  );
  await batterseaScriptsV1.deployed();

  console.log("BatterseaScriptsV1 deployed to: ", batterseaScriptsV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
