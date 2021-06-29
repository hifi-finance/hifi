import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import { HifiFlashUniswapV2, HifiFlashUniswapV2__factory } from "../../typechain";

const balanceSheetAddress: string = getEnvVar("BALANCE_SHEET_ADDRESS");
const usdcAddress: string = getEnvVar("USDC_ADDRESS");
const uniV2PairAddress: string = getEnvVar("UNI_V2_PAIR_ADDRESS");

async function main(): Promise<void> {
  const hifiFlashUniswapV2Factory: HifiFlashUniswapV2__factory = await ethers.getContractFactory("HifiFlashUniswapV2");
  const hifiFlashUniswapV2: HifiFlashUniswapV2 = await hifiFlashUniswapV2Factory.deploy(
    balanceSheetAddress,
    usdcAddress,
    [uniV2PairAddress],
  );
  await hifiFlashUniswapV2.deployed();

  console.log("HifiFlashUniswapV2 deployed to: ", hifiFlashUniswapV2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
