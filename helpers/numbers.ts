import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

import { CHAINLINK_PRICE_PRECISION, FY_TOKEN_DECIMALS, TEN, USDC_DECIMALS, WBTC_DECIMALS } from "./constants";

export function getWholeFyUsdcAmount(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(TEN.pow(FY_TOKEN_DECIMALS));
}

export function getWholeOraclePrice(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(TEN.pow(CHAINLINK_PRICE_PRECISION));
}

export function getWholeUsdcAmount(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(TEN.pow(USDC_DECIMALS));
}

export function getPartialWbtcAmount(divisor: number): BigNumber {
  return TEN.pow(WBTC_DECIMALS).div(divisor);
}

export function getWholeWbtcAmount(amount: BigNumberish): BigNumber {
  return BigNumber.from(amount).mul(TEN.pow(WBTC_DECIMALS));
}
