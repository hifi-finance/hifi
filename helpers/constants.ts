import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

import { bn } from "./numbers";

export const CUTOFF_TTM: string = "119836799";
export const E: string = "2.718281828459045235";
export const EPSILON: BigNumber = fp("1e-9");
export const FEE: string = "1e-6";
export const FY_TOKEN_EXPIRATION_TIME: BigNumber = bn("1656626400"); // June 30, 2022
export const FY_TOKEN_NAME: string = "Hifi USDC (2022-06-30)";
export const FY_TOKEN_SYMBOL: string = "hUSDCJun22";
export const K: string = "7.927447996e-9";
export const G1: string = "0.95";
export const G2: string = "1.052631578947368421";
export const HIFI_POOL_NAME: string = "Hifi USDC (2022-06-30) Pool";
export const HIFI_POOL_SYMBOL: string = "hUSDCJun22LP";
export const MAX_UD60x18: string = "115792089237316195423570985008687907853269984665640564039457.584007913129639935";
export const PI: string = "3.141592653589793238";
export const SCALE: string = "1";
