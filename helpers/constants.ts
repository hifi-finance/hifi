import { BigNumber } from "@ethersproject/bignumber";

import { now, secondsInYears } from "./time";

export const CHAINLINK_PRICE_PRECISION: BigNumber = BigNumber.from(8);
export const FY_TOKEN_DECIMALS: BigNumber = BigNumber.from(18);
export const FY_TOKEN_EXPIRATION_TIME: BigNumber = now().add(secondsInYears(1));
export const TEN: BigNumber = BigNumber.from(10);
export const USDC_DECIMALS: BigNumber = BigNumber.from(6);
export const USDC_NAME: string = "USD Coin";
export const USDC_SYMBOL: string = "USDC";
export const WBTC_DECIMALS: BigNumber = BigNumber.from(6);
export const WBTC_NAME: string = "Wrapped BTC";
export const WBTC_SYMBOL: string = "WBTC";
