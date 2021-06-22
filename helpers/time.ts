import { BigNumber } from "@ethersproject/bignumber";

export function now(): BigNumber {
  return BigNumber.from(Math.round(new Date().getTime() / 1000));
}

export function secondsInDays(days: number): string {
  const daysBn = BigNumber.from(days);
  return daysBn.mul(BigNumber.from("86400")).toString();
}

export function secondsInHours(hours: number): string {
  const hoursBn = BigNumber.from(hours);
  return hoursBn.mul(BigNumber.from("3600")).toString();
}

/// This is based on the calendar common year definition, which assumes 365 days.
export function secondsInYears(years: number): string {
  const yearsBn = BigNumber.from(years);
  return yearsBn.mul(BigNumber.from("31536000")).toString();
}
