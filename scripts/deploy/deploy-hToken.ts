import { Contract } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import { HToken__factory } from "../../typechain";

const name: string = getEnvVar("H_TOKEN_NAME");
const symbol: string = getEnvVar("H_TOKEN_SYMBOL");
const expirationTime: string = getEnvVar("H_TOKEN_EXPIRATION_TIME");
const balanceSheetAddress: string = getEnvVar("BALANCE_SHEET_ADDRESS");
const underlyingAddress: string = getEnvVar("UNDERLYING_ADDRESS");

async function main(): Promise<void> {
  const hTokenFactory: HToken__factory = await ethers.getContractFactory("HToken");
  const hToken: Contract = await hTokenFactory.deploy(
    name,
    symbol,
    expirationTime,
    balanceSheetAddress,
    underlyingAddress,
  );
  await hToken.deployed();
  console.log("HToken deployed to: ", hToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
