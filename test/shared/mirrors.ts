import { BigNumber as MathjsBigNumber } from "mathjs";

import { G1, G2, K } from "../../helpers/constants";
import { mbn, pow } from "../../helpers/math";

export function getQuoteForBuyingHToken(
  hTokenReserves: string,
  underlyingReserves: string,
  hTokenOut: string,
  timeToMaturity: string,
): string {
  const exponent: string = getYieldExponent(timeToMaturity, G1);
  const underlyingIn: string = inForOut(hTokenReserves, underlyingReserves, hTokenOut, exponent);
  return underlyingIn;
}

export function getQuoteForBuyingUnderlying(
  underlyingReserves: string,
  hTokenReserves: string,
  underlyingOut: string,
  timeToMaturity: string,
): string {
  const exponent: string = getYieldExponent(timeToMaturity, G2);
  const hTokenIn: string = inForOut(underlyingReserves, hTokenReserves, underlyingOut, exponent);
  return hTokenIn;
}

export function getQuoteForSellingHToken(
  hTokenReserves: string,
  underlyingReserves: string,
  hTokenIn: string,
  timeToMaturity: string,
): string {
  const exponent: string = getYieldExponent(timeToMaturity, G2);
  const underlyingIn: string = outForIn(hTokenReserves, underlyingReserves, hTokenIn, exponent);
  return underlyingIn;
}

export function getQuoteForSellingUnderlying(
  underlyingReserves: string,
  hTokenReserves: string,
  underlyingIn: string,
  timeToMaturity: string,
): string {
  const exponent: string = getYieldExponent(timeToMaturity, G1);
  const hTokenOut: string = outForIn(underlyingReserves, hTokenReserves, underlyingIn, exponent);
  return hTokenOut;
}

export function getYieldExponent(timeToMaturity: string, g: string): string {
  return mbn("1")
    .sub(mbn(K).mul(mbn(timeToMaturity)).mul(mbn(g)))
    .toString();
}

/// "s" comes from "starting", "d" comes from "delta".
export function inForOut(xs: string, ys: string, xd: string, exp: string): string {
  const xs1gt = <MathjsBigNumber>pow(mbn(xs), mbn(exp));
  const ys1gt = <MathjsBigNumber>pow(mbn(ys), mbn(exp));
  const x = <MathjsBigNumber>mbn(xs).sub(mbn(xd));
  const x1gt = <MathjsBigNumber>pow(mbn(x), mbn(exp));
  const y = <MathjsBigNumber>pow(xs1gt.add(ys1gt).sub(x1gt), mbn("1").div(mbn(exp)));
  const yd = <MathjsBigNumber>y.sub(mbn(ys));
  return String(yd);
}

/// "s" comes from "starting", "d" comes from "delta".
export function outForIn(xs: string, ys: string, xd: string, exp: string): string {
  const xs1gt = <MathjsBigNumber>pow(mbn(xs), mbn(exp));
  const ys1gt = <MathjsBigNumber>pow(mbn(ys), mbn(exp));
  const x = <MathjsBigNumber>mbn(xs).add(mbn(xd));
  const x1gt = <MathjsBigNumber>pow(mbn(x), mbn(exp));
  const y = <MathjsBigNumber>pow(xs1gt.add(ys1gt).sub(x1gt), mbn("1").div(mbn(exp)));
  const yd = <MathjsBigNumber>mbn(ys).sub(y);
  return String(yd);
}
