import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

import { chainlinkPricePrecision, fyTokenConstants, ten, usdcConstants, wbtcConstants } from "./constants";

export function getWholeFyUsdcAmount(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(ten.pow(fyTokenConstants.decimals));
}

export function getWholeOraclePrice(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(ten.pow(chainlinkPricePrecision));
}

export function getWholeUsdcAmount(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(ten.pow(usdcConstants.decimals));
}

export function getPartialWbtcAmount(divisor: number): BigNumber {
  return ten.pow(wbtcConstants.decimals).div(divisor);
}

export function getWholeWbtcAmount(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(ten.pow(wbtcConstants.decimals));
}
