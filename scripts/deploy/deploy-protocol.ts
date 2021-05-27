import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";

const collateralAddress: string = getEnvVar("COLLATERAL_ADDRESS");
const hTokenExpirationTime: string = getEnvVar("FY_TOKEN_EXPIRATION_TIME");
const hTokenName: string = getEnvVar("FY_TOKEN_NAME");
const hTokenSymbol: string = getEnvVar("FY_TOKEN_SYMBOL");
const stablecoinPrice: string = getEnvVar("STABLECOIN_PRICE");
const stablecoinPriceFeedDescription: string = getEnvVar("STABLECOIN_PRICE_FEED_DESCRIPTION");
const underlyingAddress: string = getEnvVar("UNDERLYING_ADDRESS");

async function main(): Promise<void> {
  // Deploy Fintroller
  const fintrollerFactory: ContractFactory = await ethers.getContractFactory("Fintroller");
  const fintroller: Contract = await fintrollerFactory.deploy();
  await fintroller.deployed();
  console.log("Fintroller deployed to: ", fintroller.address);

  // Deploy BalanceSheet
  const balanceSheetFactory: ContractFactory = await ethers.getContractFactory("BalanceSheet");
  const balanceSheet: Contract = await balanceSheetFactory.deploy(fintroller.address);
  await balanceSheet.deployed();
  console.log("BalanceSheet deployed to: ", balanceSheet.address);

  // Deploy HToken
  const hTokenFactory: ContractFactory = await ethers.getContractFactory("HToken");
  const hToken: Contract = await hTokenFactory.deploy(
    hTokenName,
    hTokenSymbol,
    hTokenExpirationTime,
    fintroller.address,
    balanceSheet.address,
    underlyingAddress,
    collateralAddress,
  );
  await hToken.deployed();
  console.log("HToken deployed to: ", hToken.address);

  // Deploy ChainlinkOperator
  const chainlinkOperatorFactory: ContractFactory = await ethers.getContractFactory("ChainlinkOperator");
  const chainlinkOperator: Contract = await chainlinkOperatorFactory.deploy();
  await chainlinkOperator.deployed();
  console.log("ChainlinkOperator deployed to: ", chainlinkOperator.address);

  // Deploy StablecoinPriceFeed
  const stablecoinPriceFeedFactory: ContractFactory = await ethers.getContractFactory("StablecoinPriceFeed");
  const stablecoinPriceFeed: Contract = await stablecoinPriceFeedFactory.deploy(
    stablecoinPrice,
    stablecoinPriceFeedDescription,
  );
  await stablecoinPriceFeed.deployed();
  console.log("StablecoinPriceFeed deployed to: ", stablecoinPriceFeed.address);

  // Deploy BatterseaTargetV1
  const batterseaTargetV1Factory: ContractFactory = await ethers.getContractFactory("BatterseaTargetV1");
  const batterseaTargetV1: Contract = await batterseaTargetV1Factory.deploy();
  await batterseaTargetV1.deployed();
  console.log("BatterseaTargetV1 deployed to: ", batterseaTargetV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
