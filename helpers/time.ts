import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export function secondsInDays(days: BigNumberish): BigNumber {
  const daysBn = BigNumber.from(days);
  return daysBn.mul(BigNumber.from("86400"));
}

export function secondsInHours(hours: BigNumberish): BigNumber {
  const hoursBn = BigNumber.from(hours);
  return hoursBn.mul(BigNumber.from("3600"));
}

/// This is based on the calendar common year definition, which assumes 365 days.
export function secondsInYears(years: BigNumberish): BigNumber {
  const yearsBn = BigNumber.from(years);
  return yearsBn.mul(BigNumber.from("31536000"));
}
