import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";

const fintrollerAddress: string = getEnvVar("FINTROLLER_ADDRESS");

async function main(): Promise<void> {
  const balanceSheetFactory: ContractFactory = await ethers.getContractFactory("BalanceSheet");
  const balanceSheet: Contract = await balanceSheetFactory.deploy(fintrollerAddress);
  await balanceSheet.deployed();
  console.log("BalanceSheet deployed to: ", balanceSheet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
