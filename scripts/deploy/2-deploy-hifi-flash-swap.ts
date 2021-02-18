import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";

const balanceSheetAddress: string = getEnvVar("BALANCE_SHEET_ADDRESS");
const uniV2WbtcUsdcAddress: string = getEnvVar("UNI_V2_WBTC_USDC_ADDRESS");

async function main(): Promise<void> {
  const hifiFlashSwapFactory: ContractFactory = await ethers.getContractFactory("HifiFlashSwap");
  const hifiFlashSwap: Contract = await hifiFlashSwapFactory.deploy(balanceSheetAddress, uniV2WbtcUsdcAddress);
  await hifiFlashSwap.deployed();

  console.log("HifiFlashSwap deployed to: ", hifiFlashSwap.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
