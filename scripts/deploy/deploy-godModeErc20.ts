import { Contract } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import { GodModeErc20__factory } from "../../typechain";

const name: string = getEnvVar("ERC20_NAME");
const symbol: string = getEnvVar("ERC20_SYMBOL");
const decimals: string = getEnvVar("ERC20_DECIMALS");

async function main(): Promise<void> {
  const godModeErc20Factory: GodModeErc20__factory = await ethers.getContractFactory("GodModeErc20");
  const godModeErc20: Contract = await godModeErc20Factory.deploy(name, symbol, decimals);
  await godModeErc20.deployed();
  console.log("GodModeErc20 deployed to: ", godModeErc20.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
