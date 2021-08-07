import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

import { getHTokenName, getHTokenSymbol } from "./contracts";
import { bn } from "./numbers";
import { now, secondsInYears } from "./time";

export const CUTOFF_TTM: string = "119836799";
export const E: string = "2.718281828459045235";
export const EPSILON: BigNumber = fp("1e-9");
export const K: string = "7.927447996e-9";
export const G1: string = "0.95";
export const G2: string = "1.052631578947368421";
export const H_TOKEN_DECIMALS: BigNumber = bn("18");
export const H_TOKEN_MATURITY: BigNumber = now().add(secondsInYears(1));
export const H_TOKEN_NAME: string = getHTokenName(H_TOKEN_MATURITY);
export const H_TOKEN_SYMBOL: string = getHTokenSymbol(H_TOKEN_MATURITY);
export const HIFI_POOL_NAME: string = H_TOKEN_NAME + " Pool";
export const HIFI_POOL_SYMBOL: string = H_TOKEN_SYMBOL + "LP";
export const MAX_INT256: string = "57896044618658097711785492504343953926634992332820282019728792003956564819967";
export const MAX_UD60x18: string = "115792089237316195423570985008687907853269984665640564039457.584007913129639935";
export const SCALE: string = "1";
export const UNDERLYING_PRECISION_SCALAR: BigNumber = bn("1e12");
export const USDC_DECIMALS: string = "6";
export const USDC_NAME: string = "USD Coin";
export const USDC_SYMBOL: string = "USDC";
