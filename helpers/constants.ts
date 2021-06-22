import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

import { bn } from "./numbers";
import { now, secondsInYears } from "./time";

export const CUTOFF_TTM: string = "119836799";
export const E: string = "2.718281828459045235";
export const EPSILON: BigNumber = fp("1e-9");
export const H_TOKEN_EXPIRATION_TIME: BigNumber = now().add(secondsInYears(1));
export const H_TOKEN_NAME: string = "Hifi USDC (2022-06-30)";
export const H_TOKEN_SYMBOL: string = "hUSDCJun22";
export const K: string = "7.927447996e-9";
export const G1: string = "0.95";
export const G2: string = "1.052631578947368421";
export const HIFI_POOL_NAME: string = "Hifi USDC (2022-06-30) Pool";
export const HIFI_POOL_SYMBOL: string = "hUSDCJun22LP";
export const MAX_UD60x18: string = "115792089237316195423570985008687907853269984665640564039457.584007913129639935";
export const PI: string = "3.141592653589793238";
export const SCALE: string = "1";
export const UNDERLYING_PRECISION_SCALAR: BigNumber = bn("1e12");
export const USDC_DECIMALS: string = "6";
export const USDC_NAME: string = "USD Coin";
export const USDC_SYMBOL: string = "USDC";
