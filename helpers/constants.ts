import { BigNumber } from "@ethersproject/bignumber";

import { bn, fp, maxUint, sfp } from "./numbers";

export const CUTOFF_TTM: BigNumber = bn("119836799");
export const E: BigNumber = fp("2.718281828459045235");
export const FEE: BigNumber = sfp("1e-6");
export const K: BigNumber = sfp("7.927447996e-9");
export const G1: BigNumber = fp("0.95");
export const G2: BigNumber = fp("1.052631578947368421");
export const MAX_UD60x18: BigNumber = maxUint(256); // Equivalent to max uint256
export const PI: BigNumber = fp("3.141592653589793238");
export const SCALE: BigNumber = fp("1");
export const ZERO = BigNumber.from(0);
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
