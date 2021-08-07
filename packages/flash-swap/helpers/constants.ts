import { BigNumber } from "@ethersproject/bignumber";

import { bn } from "./numbers";
import { now, secondsInYears } from "./time";

export const CHAINLINK_PRICE_PRECISION: BigNumber = bn("8");
export const H_TOKEN_DECIMALS: BigNumber = bn("18");
export const H_TOKEN_MATURITY: BigNumber = now().add(secondsInYears(1));
export const TEN: BigNumber = bn("10");
export const USDC_DECIMALS: BigNumber = bn("6");
export const USDC_NAME: string = "USD Coin";
export const USDC_SYMBOL: string = "USDC";
export const WBTC_DECIMALS: BigNumber = bn("8");
export const WBTC_NAME: string = "Wrapped BTC";
export const WBTC_SYMBOL: string = "WBTC";
