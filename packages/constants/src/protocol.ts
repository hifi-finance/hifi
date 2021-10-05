import { BigNumber } from "@ethersproject/bignumber";
import { toBn } from "evm-bn";

function getDaysInSeconds(days: number): BigNumber {
  const oneDay: BigNumber = BigNumber.from(86400);
  return oneDay.mul(days);
}

function getNow(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

function getYearsInSeconds(years: number): BigNumber {
  const oneYear = BigNumber.from(years);
  return oneYear.mul(BigNumber.from(31_536_000));
}

export const CHAINLINK_PRICE_PRECISION: BigNumber = BigNumber.from(8);
export const CHAINLINK_PRICE_PRECISION_SCALAR: BigNumber = BigNumber.from(10_000_000_000);
export const COLLATERAL_RATIOS = {
  default: toBn("1.50"),
  lowerBound: toBn("1.00"),
  upperBound: toBn("100.00"),
  wbtc: toBn("2.00"),
  weth: toBn("1.50"),
};
export const DEFAULT_MAX_BONDS: BigNumber = BigNumber.from(10);
export const H_TOKEN_DECIMALS: BigNumber = BigNumber.from(18);
export const H_TOKEN_MATURITY_ONE_YEAR: BigNumber = getNow().add(getYearsInSeconds(1));
export const H_TOKEN_MATURITY_THREE_MONTHS: BigNumber = getNow().add(getDaysInSeconds(90));
export const LIQUIDATION_INCENTIVES = {
  default: toBn("1.10"),
  lowerBound: toBn("1.00"),
  upperBound: toBn("1.50"),
};
