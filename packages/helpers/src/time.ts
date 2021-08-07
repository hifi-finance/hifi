import { BigNumber } from "@ethersproject/bignumber";

export function getDaysInSeconds(days: number): BigNumber {
  const oneDay: BigNumber = BigNumber.from(86400);
  return oneDay.mul(days);
}

export function getNow(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

/// Based on the calendar common year definition, which assumes 365 days.
export function getYearsInSeconds(years: number): BigNumber {
  const oneYear = BigNumber.from(years);
  return oneYear.mul(BigNumber.from("31536000"));
}
