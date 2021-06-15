import { Contract } from "@ethersproject/contracts";
import { ethers, upgrades } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import { BalanceSheetV1__factory } from "../../typechain";

const fintrollerAddress: string = getEnvVar("FINTROLLER_ADDRESS");
const oracleAddress: string = getEnvVar("ORACLE_ADDRESS");

async function main(): Promise<void> {
  const balanceSheetV1Factory: BalanceSheetV1__factory = await ethers.getContractFactory("BalanceSheetV1");
  const balanceSheet: Contract = await upgrades.deployProxy(balanceSheetV1Factory, [fintrollerAddress, oracleAddress]);
  await balanceSheet.deployed();
  console.log("BalanceSheet deployed to: ", balanceSheet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
