import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

import {
  NORMALIZED_WBTC_PRICE,
  NORMALIZED_WETH_PRICE,
  WBTC_COLLATERALIZATION_RATIO,
  WBTC_PRECISION_SCALAR,
  WETH_COLLATERALIZATION_RATIO,
} from "./constants";

const SCALE = fp("1");
const HALF_SCALE = fp("0.5");

export function div(x: BigNumber, y: BigNumber): BigNumber {
  return x.mul(SCALE).div(y);
}

export function mul(x: BigNumber, y: BigNumber): BigNumber {
  const doubleScaledProduct = x.mul(y);
  let doubleScaledProductWithHalfScale: BigNumber;
  if (doubleScaledProduct.isNegative()) {
    doubleScaledProductWithHalfScale = doubleScaledProduct.sub(HALF_SCALE);
  } else {
    doubleScaledProductWithHalfScale = doubleScaledProduct.add(HALF_SCALE);
  }
  const result: BigNumber = doubleScaledProductWithHalfScale.div(SCALE);
  return result;
}

export function weighWbtc(
  wbtcAmount: BigNumber,
  collateralizationRatio: BigNumber = WBTC_COLLATERALIZATION_RATIO,
): BigNumber {
  const normalizedWbtcAmount: BigNumber = wbtcAmount.mul(WBTC_PRECISION_SCALAR);
  return div(mul(normalizedWbtcAmount, NORMALIZED_WBTC_PRICE), collateralizationRatio);
}

export function weighWeth(
  wethAmount: BigNumber,
  collateralizationRatio: BigNumber = WETH_COLLATERALIZATION_RATIO,
): BigNumber {
  return div(mul(wethAmount, NORMALIZED_WETH_PRICE), collateralizationRatio);
}
