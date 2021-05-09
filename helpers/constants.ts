import { BigNumber } from "@ethersproject/bignumber";

import { fp, maxInt, minInt, sfp } from "./numbers";
import { secondsInYears } from "./time";

export const CUTOFF_TIME_TO_MATURITY: BigNumber = fp("119836799");
export const E: BigNumber = fp("2.718281828459045235");
export const K: BigNumber = sfp("7.927447996e-9");
export const G1: BigNumber = fp("0.95");
export const G2: BigNumber = fp("1.052631578947368421");
export const MAX_SD59x18: BigNumber = maxInt(256);
export const MIN_SD59x18: BigNumber = minInt(256);
export const PI: BigNumber = fp("3.141592653589793238");
export const SECONDS_YEAR: BigNumber = secondsInYears(1);
export const SECONDS_FOUR_YEARS: BigNumber = secondsInYears(4);
export const SCALE: BigNumber = fp("1");
export const ZERO = BigNumber.from(0);
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
