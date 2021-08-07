import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";
import fromExponential from "from-exponential";

function getDaysInSeconds(days: number): BigNumber {
  const oneDay: BigNumber = BigNumber.from(86400);
  return oneDay.mul(days);
}

function getNow(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

function getYearsInSeconds(years: number): BigNumber {
  const oneYear = BigNumber.from(years);
  return oneYear.mul(BigNumber.from("31536000"));
}

export const CHAINLINK_PRICE_PRECISION: BigNumber = BigNumber.from("8");
export const CHAINLINK_PRICE_PRECISION_SCALAR: BigNumber = BigNumber.from(fromExponential("1e10"));
export const COLLATERALIZATION_RATIOS = {
  default: fp("1.50"),
  lowerBound: fp("1.00"),
  upperBound: fp("100.00"),
  wbtc: fp("2.00"),
  weth: fp("1.50"),
};
export const DEFAULT_MAX_BONDS: BigNumber = BigNumber.from("10");
export const H_TOKEN_DECIMALS: BigNumber = BigNumber.from("18");
export const H_TOKEN_MATURITIES: BigNumber[] = [getNow().add(getDaysInSeconds(90)), getNow().add(getYearsInSeconds(1))];
export const LIQUIDATION_INCENTIVES = {
  default: fp("1.10"),
  lowerBound: fp("1.00"),
  upperBound: fp("1.50"),
};
export const MAX_INT256: BigNumber = BigNumber.from(
  "57896044618658097711785492504343953926634992332820282019728792003956564819967",
);
