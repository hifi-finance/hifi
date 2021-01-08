import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

let fintrollerAddress: string;
if (!process.env.FINTROLLER_ADDRESS) {
  throw new Error("Please set FINTROLLER_ADDRESS as an env variable");
} else {
  fintrollerAddress = process.env.FINTROLLER_ADDRESS;
}

let balanceSheetAddress: string;
if (!process.env.BALANCE_SHEET_ADDRESS) {
  throw new Error("Please set BALANCE_SHEET_ADDRESS as an env variable");
} else {
  balanceSheetAddress = process.env.BALANCE_SHEET_ADDRESS;
}

let uniswapV2PairAddress: string;
if (!process.env.UNISWAP_V2_PAIR_ADDRESS) {
  throw new Error("Please set UNISWAP_V2_PAIR_ADDRESS as an env variable");
} else {
  uniswapV2PairAddress = process.env.UNISWAP_V2_PAIR_ADDRESS;
}

async function main(): Promise<void> {
  const hifiFlashSwapFactory: ContractFactory = await ethers.getContractFactory("HifiFlashSwap");
  const hifiFlashSwap: Contract = await hifiFlashSwapFactory.deploy(
    fintrollerAddress,
    balanceSheetAddress,
    uniswapV2PairAddress,
  );
  await hifiFlashSwap.deployed();

  console.log("HifiFlashSwap deployed to: ", hifiFlashSwap.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
