import { BigNumber } from "@ethersproject/bignumber";
import { toBn } from "evm-bn";

export const CUTOFF_TTM: BigNumber = BigNumber.from("119836799");
export const EPSILON: BigNumber = toBn("1e-9");
export const K: BigNumber = toBn("7.927447996e-9");
export const G1: BigNumber = toBn("0.95");
export const G2: BigNumber = toBn("1.052631578947368421");
