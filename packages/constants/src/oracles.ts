import { BigNumber } from "@ethersproject/bignumber";

export const DEFAULT_CARDINALITY: number = 144;
export const DEFAULT_TWAP_INTERVAL: number = 1800;
export const Q192: BigNumber = BigNumber.from("6277101735386680763835789423207666416102355444464034512896");
export const TICKS = {
  lowerBound: -798544800,
  upperBound: 798544800,
};
