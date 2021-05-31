import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

import { bn, precisionScalarForDecimals, price } from "./numbers";
import { now, secondsInDays, secondsInYears } from "./time";

export const ADDRESS_ONE: string = "0x0000000000000000000000000000000000000001";

export const CHAINLINK_PRICE_PRECISION: BigNumber = bn("8");
export const CHAINLINK_PRICE_PRECISION_SCALAR: BigNumber = bn("1e10");

export const COLLATERALIZATION_RATIO_LOWER_BOUND: BigNumber = fp("1.00");
export const COLLATERALIZATION_RATIO_UPPER_BOUND: BigNumber = fp("100.00");

export const DEFAULT_COLLATERALIZATION_RATIO: BigNumber = fp("1.50");
export const DEFAULT_LIQUIDATION_INCENTIVE: BigNumber = fp("1.10");

export const GAS_LIMIT_HARDHAT: BigNumber = bn("1e8");
export const GAS_LIMIT_COVERAGE: BigNumber = bn("5e8");

export const H_TOKEN_DECIMALS: BigNumber = bn("18");
export const H_TOKEN_EXPIRATION_TIMES: BigNumber[] = [now().add(secondsInDays(90)), now().add(secondsInYears(1))];

export const LIQUIDATION_INCENTIVE_LOWER_BOUND: BigNumber = fp("1.00");
export const LIQUIDATION_INCENTIVE_UPPER_BOUND: BigNumber = fp("1.50");

export const MAX_INT256: BigNumber = bn(
  "57896044618658097711785492504343953926634992332820282019728792003956564819967",
);
export const NORMALIZED_USDC_PRICE: BigNumber = fp("1");
export const NORMALIZED_WBTC_PRICE: BigNumber = fp("50000");
export const NORMALIZED_WETH_PRICE: BigNumber = fp("2000");

export const USDC_DECIMALS: BigNumber = bn("6");
export const USDC_NAME: string = "USD Coin";
export const USDC_PRECISION_SCALAR: BigNumber = precisionScalarForDecimals(USDC_DECIMALS);
export const USDC_SYMBOL: string = "USDC";

export const WBTC_COLLATERALIZATION_RATIO: BigNumber = fp("2.00");
export const WBTC_DECIMALS: BigNumber = bn("8");
export const WBTC_SYMBOL: string = "WBTC";
export const WBTC_NAME: string = "Wrapped BTC";
export const WBTC_PRECISION_SCALAR: BigNumber = precisionScalarForDecimals(WBTC_DECIMALS);
export const WBTC_PRICE: BigNumber = price("50000");

export const WETH_COLLATERALIZATION_RATIO: BigNumber = fp("1.50");
export const WETH_DECIMALS: BigNumber = bn("18");
export const WETH_NAME: string = "Wrapped Ether";
export const WETH_SYMBOL: string = "WETH";
