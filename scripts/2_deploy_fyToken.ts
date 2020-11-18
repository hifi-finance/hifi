import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "@nomiclabs/buidler";

const name: string = "hfyUSDC (2021-26-02)";
const symbol: string = "hfyUSDC-FEB21";
const expirationTime: number = 1614373200;

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

let underlyingAddress: string;
if (!process.env.UNDERLYING_ADDRESS) {
  throw new Error("Please set UNDERLYING_ADDRESS as an env variable");
} else {
  underlyingAddress = process.env.UNDERLYING_ADDRESS;
}

let collateralAddress: string;
if (!process.env.COLLATERAL_ADDRESS) {
  throw new Error("Please set COLLATERAL_ADDRESS as an env variable");
} else {
  collateralAddress = process.env.COLLATERAL_ADDRESS;
}

async function main(): Promise<void> {
  const fyTokenFactory: ContractFactory = await ethers.getContractFactory("FyToken");
  const fyToken: Contract = await fyTokenFactory.deploy(
    name,
    symbol,
    expirationTime,
    fintrollerAddress,
    balanceSheetAddress,
    underlyingAddress,
    collateralAddress,
  );
  await fyToken.deployed();

  console.log("FyToken deployed to: ", fyToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
