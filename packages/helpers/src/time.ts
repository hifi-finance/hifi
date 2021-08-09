import { BigNumber } from "@ethersproject/bignumber";

export function getDaysInSeconds(days: number): string {
  const oneDay: BigNumber = BigNumber.from("86400");
  return oneDay.mul(days).toString();
}

export function getHoursInSeconds(hours: number): string {
  const hoursBn = BigNumber.from(hours);
  return hoursBn.mul(BigNumber.from("3600")).toString();
}

export function getNow(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

/// Based on the calendar common year definition, which assumes 365 days.
export function getYearsInSeconds(years: number): string {
  const oneYear = BigNumber.from(years);
  return oneYear.mul(BigNumber.from("31536000")).toString();
}
