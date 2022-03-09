import type { BigNumber } from "@ethersproject/bignumber";
import { SCALE, div, mul, pow } from "@prb/math";

import { G1, G2, K } from "./constants";

export function getQuoteForBuyingHToken(
  virtualHTokenReserves: BigNumber,
  normalizedUnderlyingReserves: BigNumber,
  hTokenOut: BigNumber,
  normalizedTimeToMaturity: BigNumber,
): BigNumber {
  const exponent: BigNumber = getYieldExponent(normalizedTimeToMaturity, G1);
  const normalizedUnderlyingIn: BigNumber = inForOut(
    virtualHTokenReserves,
    normalizedUnderlyingReserves,
    hTokenOut,
    exponent,
  );
  return normalizedUnderlyingIn;
}

export function getQuoteForBuyingUnderlying(
  normalizedUnderlyingReserves: BigNumber,
  virtualHTokenReserves: BigNumber,
  normalizedUnderlyingOut: BigNumber,
  normalizedTimeToMaturity: BigNumber,
): BigNumber {
  const exponent: BigNumber = getYieldExponent(normalizedTimeToMaturity, G2);
  const hTokenIn: BigNumber = inForOut(
    normalizedUnderlyingReserves,
    virtualHTokenReserves,
    normalizedUnderlyingOut,
    exponent,
  );
  return hTokenIn;
}

export function getQuoteForSellingHToken(
  hTokenReserves: BigNumber,
  normalizedUnderlyingReserves: BigNumber,
  hTokenIn: BigNumber,
  normalizedTimeToMaturity: BigNumber,
): BigNumber {
  const exponent: BigNumber = getYieldExponent(normalizedTimeToMaturity, G2);
  const underlyingIn: BigNumber = outForIn(hTokenReserves, normalizedUnderlyingReserves, hTokenIn, exponent);
  return underlyingIn;
}

export function getQuoteForSellingUnderlying(
  normalizedUnderlyingReserves: BigNumber,
  virtualHTokenReserves: BigNumber,
  normalizedUnderlyingIn: BigNumber,
  normalizedTimeToMaturity: BigNumber,
): BigNumber {
  const exponent: BigNumber = getYieldExponent(normalizedTimeToMaturity, G1);
  const hTokenOut: BigNumber = outForIn(
    normalizedUnderlyingReserves,
    virtualHTokenReserves,
    normalizedUnderlyingIn,
    exponent,
  );
  return hTokenOut;
}

export function getYieldExponent(normalizedTimeToMaturity: BigNumber, g: BigNumber): BigNumber {
  const t: BigNumber = mul(K, normalizedTimeToMaturity);
  return SCALE.sub(mul(g, t));
}

// "s" comes from "starting", "d" comes from "delta".
export function inForOut(xs: BigNumber, ys: BigNumber, xd: BigNumber, exp: BigNumber): BigNumber {
  const xs1gt: BigNumber = pow(xs, exp);
  const ys1gt: BigNumber = pow(ys, exp);
  const x: BigNumber = xs.sub(xd);
  const x1gt: BigNumber = pow(x, exp);
  const y: BigNumber = pow(xs1gt.add(ys1gt).sub(x1gt), div(SCALE, exp));
  const yd: BigNumber = y.sub(ys);
  return yd;
}

// "s" comes from "starting", "d" comes from "delta".
export function outForIn(xs: BigNumber, ys: BigNumber, xd: BigNumber, exp: BigNumber): BigNumber {
  const xs1gt: BigNumber = pow(xs, exp);
  const ys1gt: BigNumber = pow(ys, exp);
  const x: BigNumber = xs.add(xd);
  const x1gt: BigNumber = pow(x, exp);
  const y: BigNumber = pow(xs1gt.add(ys1gt).sub(x1gt), div(SCALE, exp));
  const yd: BigNumber = ys.sub(y);
  return yd;
}
