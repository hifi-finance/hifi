import { BigNumber } from "@ethersproject/bignumber";

import { fp, maxUint } from "./numbers";

export const CUTOFF_TTM: string = "119836799";
export const E: string = "2.718281828459045235";
export const EPSILON: BigNumber = fp("1e-9");
export const FEE: string = "1e-6";
export const K: string = "7.927447996e-9";
export const G1: string = "0.95";
export const G2: string = "1.052631578947368421";
export const MAX_UD60x18: string = String(maxUint(256)); // Equivalent to max uint256
export const PI: string = "3.141592653589793238";
export const SCALE: BigNumber = fp("1");
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
