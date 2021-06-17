import { Contract } from "@ethersproject/contracts";
import { ethers, upgrades } from "hardhat";

import { getEnvVar } from "../../helpers/env";
import {
  BalanceSheetV1__factory,
  ChainlinkOperator__factory,
  FintrollerV1__factory,
  HToken__factory,
  RegentsTargetV1__factory,
  StablecoinPriceFeed__factory,
} from "../../typechain";

const hTokenExpirationTime: string = getEnvVar("H_TOKEN_EXPIRATION_TIME");
const hTokenName: string = getEnvVar("H_TOKEN_NAME");
const hTokenSymbol: string = getEnvVar("H_TOKEN_SYMBOL");
const stablecoinPrice: string = getEnvVar("STABLECOIN_PRICE");
const stablecoinPriceFeedDescription: string = getEnvVar("STABLECOIN_PRICE_FEED_DESCRIPTION");
const underlyingAddress: string = getEnvVar("UNDERLYING_ADDRESS");

async function main(): Promise<void> {
  // Deploy Fintroller
  const fintrollerV1Factory: FintrollerV1__factory = await ethers.getContractFactory("FintrollerV1");
  const fintrollerV1: Contract = await upgrades.deployProxy(fintrollerV1Factory);
  await fintrollerV1.deployed();
  console.log("FintrollerV1 deployed to: ", fintrollerV1.address);

  // Deploy ChainlinkOperator
  const chainlinkOperatorFactory: ChainlinkOperator__factory = await ethers.getContractFactory("ChainlinkOperator");
  const chainlinkOperator: Contract = await chainlinkOperatorFactory.deploy();
  await chainlinkOperator.deployed();
  console.log("ChainlinkOperator deployed to: ", chainlinkOperator.address);

  // Deploy BalanceSheet
  const balanceSheetV1Factory: BalanceSheetV1__factory = await ethers.getContractFactory("BalanceSheetV1");
  const balanceSheetV1: Contract = await upgrades.deployProxy(balanceSheetV1Factory, [
    fintrollerV1.address,
    chainlinkOperator.address,
  ]);
  await balanceSheetV1.deployed();
  console.log("BalanceSheetV1 deployed to: ", balanceSheetV1.address);

  // Deploy HToken
  const hTokenFactory: HToken__factory = await ethers.getContractFactory("HToken");
  const hToken: Contract = await hTokenFactory.deploy(
    hTokenName,
    hTokenSymbol,
    hTokenExpirationTime,
    balanceSheetV1.address,
    underlyingAddress,
  );
  await hToken.deployed();
  console.log("HToken deployed to: ", hToken.address);

  // Deploy StablecoinPriceFeed
  const stablecoinPriceFeedFactory: StablecoinPriceFeed__factory = await ethers.getContractFactory(
    "StablecoinPriceFeed",
  );
  const stablecoinPriceFeed: Contract = await stablecoinPriceFeedFactory.deploy(
    stablecoinPrice,
    stablecoinPriceFeedDescription,
  );
  await stablecoinPriceFeed.deployed();
  console.log("StablecoinPriceFeed deployed to: ", stablecoinPriceFeed.address);

  // Deploy RegentsTargetV1
  const regentsTargetV1Factory: RegentsTargetV1__factory = await ethers.getContractFactory("RegentsTargetV1");
  const regentsTargetV1: Contract = await regentsTargetV1Factory.deploy();
  await regentsTargetV1.deployed();
  console.log("RegentsTargetV1 deployed to: ", regentsTargetV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
