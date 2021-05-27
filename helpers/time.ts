import { BigNumber } from "@ethersproject/bignumber";

export function now(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

export function daysInSeconds(days: number): BigNumber {
  const oneDay: BigNumber = BigNumber.from(86400);
  return oneDay.mul(days);
}
