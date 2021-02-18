import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";

const name: string = getEnvVar("FY_TOKEN_NAME");
const symbol: string = getEnvVar("FY_TOKEN_SYMBOL");
const expirationTime: string = getEnvVar("FY_TOKEN_EXPIRATION_TIME");
const fintrollerAddress: string = getEnvVar("FINTROLLER_ADDRESS");
const balanceSheetAddress: string = getEnvVar("BALANCE_SHEET_ADDRESS");
const underlyingAddress: string = getEnvVar("UNDERLYING_ADDRESS");
const collateralAddress: string = getEnvVar("COLLATERAL_ADDRESS");

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
