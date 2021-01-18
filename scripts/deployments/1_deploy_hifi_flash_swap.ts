import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

let balanceSheetAddress: string;
if (!process.env.BALANCE_SHEET_ADDRESS) {
  throw new Error("Please set BALANCE_SHEET_ADDRESS as an env variable");
} else {
  balanceSheetAddress = process.env.BALANCE_SHEET_ADDRESS;
}

let uniV2WbtcUsdcAddress: string;
if (!process.env.UNI_V2_WBTC_USDC_ADDRESS) {
  throw new Error("Please set UNI_V2_WBTC_USDC_ADDRESS as an env variable");
} else {
  uniV2WbtcUsdcAddress = process.env.UNI_V2_WBTC_USDC_ADDRESS;
}

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
