import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

import { bn } from "./numbers";
import { daysInSeconds, now } from "./time";

export const ADDRESS_ONE: string = "0x0000000000000000000000000000000000000001";
export const CHAINLINK_PRICE_PRECISION: BigNumber = bn("8");
export const COLLATERAL_DECIMALS: BigNumber = bn("18");
export const COLLATERAL_NAME: string = "Wrapped ETH";
export const COLLATERAL_SYMBOL: string = "WETH";
export const FINTROLLER_COLLATERALIZATION_RATIO_LOWER_BOUND: BigNumber = fp("1.00");
export const FINTROLLER_COLLATERALIZATION_RATIO_UPPER_BOUND: BigNumber = fp("100.00");
export const FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO: BigNumber = fp("1.50");
export const FINTROLLER_DEFAULT_LIQUIDATION_INCENTIVE: BigNumber = fp("1.10");
export const FINTROLLER_LIQUIDATION_INCENTIVE_LOWER_BOUND: BigNumber = fp("1.00");
export const FINTROLLER_LIQUIDATION_INCENTIVE_UPPER_BOUND: BigNumber = fp("1.50");
export const GAS_LIMIT_HARDHAT: BigNumber = bn("1e8");
export const GAS_LIMIT_COVERAGE: BigNumber = bn("5e8");
export const H_TOKEN_DECIMALS: BigNumber = bn("18");
export const H_TOKEN_EXPIRATION_TIME: BigNumber = now().add(daysInSeconds(90));
export const H_TOKEN_EXPIRATION_DATE = new Date(H_TOKEN_EXPIRATION_TIME.toNumber() * 1000);
export const H_TOKEN_EXPIRATION_DATE_FULL = H_TOKEN_EXPIRATION_DATE.toISOString().slice(0, 10);
export const H_TOKEN_EXPIRATION_DATE_SHORT =
  H_TOKEN_EXPIRATION_DATE.toLocaleString("default", { year: "2-digit" }).toUpperCase() +
  H_TOKEN_EXPIRATION_DATE.toLocaleString("default", { month: "short" }).toUpperCase();
export const H_TOKEN_NAME: string = `Hifi USDC (${H_TOKEN_EXPIRATION_DATE_FULL})`;
export const H_TOKEN_SYMBOL: string = `hUSDC${H_TOKEN_EXPIRATION_DATE_SHORT}`;
export const MAX_INT256: BigNumber = bn(
  "57896044618658097711785492504343953926634992332820282019728792003956564819967",
);
export const UNDERLYING_DECIMALS: BigNumber = bn("6");
export const UNDERLYING_NAME: string = "USD Coin";
export const UNDERLYING_SYMBOL: string = "USDC";
