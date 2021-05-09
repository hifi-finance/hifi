import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

const SCALE: BigNumber = BigNumber.from(10).pow(18);

export function secondsInDays(days: BigNumberish): BigNumber {
  const daysBn = BigNumber.from(days);
  return daysBn.mul(BigNumber.from("86400")).mul(SCALE);
}

export function secondsInHours(hours: BigNumberish): BigNumber {
  const hoursBn = BigNumber.from(hours);
  return hoursBn.mul(BigNumber.from("3600")).mul(SCALE);
}

export function secondsInYears(years: BigNumberish): BigNumber {
  const yearsBn = BigNumber.from(years);
  return yearsBn.mul(BigNumber.from("31536000")).mul(SCALE);
}
