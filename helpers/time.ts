import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export function secondsInDays(days: BigNumberish): string {
  const daysBn = BigNumber.from(days);
  return daysBn.mul(BigNumber.from("86400")).toString();
}

export function secondsInHours(hours: BigNumberish): string {
  const hoursBn = BigNumber.from(hours);
  return hoursBn.mul(BigNumber.from("3600")).toString();
}

/// This is based on the calendar common year definition, which assumes 365 days.
export function secondsInYears(years: BigNumberish): string {
  const yearsBn = BigNumber.from(years);
  return yearsBn.mul(BigNumber.from("31536000")).toString();
}
