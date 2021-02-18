import { Contract, ContractFactory } from "@ethersproject/contracts";
import { ethers } from "hardhat";

import { getEnvVar } from "../../helpers/env";

const collateralAddress: string = getEnvVar("COLLATERAL_ADDRESS");
const fyTokenExpirationTime: string = getEnvVar("FY_TOKEN_EXPIRATION_TIME");
const fyTokenName: string = getEnvVar("FY_TOKEN_NAME");
const fyTokenSymbol: string = getEnvVar("FY_TOKEN_SYMBOL");
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

  // Deploy FyToken
  const fyTokenFactory: ContractFactory = await ethers.getContractFactory("FyToken");
  const fyToken: Contract = await fyTokenFactory.deploy(
    fyTokenName,
    fyTokenSymbol,
    fyTokenExpirationTime,
    fintroller.address,
    balanceSheet.address,
    underlyingAddress,
    collateralAddress,
  );
  await fyToken.deployed();
  console.log("FyToken deployed to: ", fyToken.address);

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
