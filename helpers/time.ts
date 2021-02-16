import { BigNumber } from "@ethersproject/bignumber";

export function getNow(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

export function getDaysInSeconds(days: number): BigNumber {
  const oneDay: BigNumber = BigNumber.from(86400);
  return oneDay.mul(days);
}
