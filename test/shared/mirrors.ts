import { BigNumber as MathjsBigNumber } from "mathjs";

import { G1, G2, K } from "../../helpers/constants";
import { mbn, pow } from "../../helpers/math";
import { USDC } from "../../helpers/numbers";

export function getQuoteForBuyingHToken(
  virtualHTokenReserves: string,
  underlyingReserves: string,
  hTokenOut: string,
  timeToMaturity: string,
): string {
  const exponent: string = getYieldExponent(timeToMaturity, G1);
  return inForOut(virtualHTokenReserves, underlyingReserves, hTokenOut, exponent);
}

export function getQuoteForSellingHToken(
  virtualHTokenReserves: string,
  underlyingReserves: string,
  hTokenIn: string,
  timeToMaturity: string,
): string {
  const exponent: string = getYieldExponent(timeToMaturity, G2);
  const normalizedUnderlyingIn: string = outForIn(virtualHTokenReserves, underlyingReserves, hTokenIn, exponent);
  const underlyingIn: string = String(USDC(normalizedUnderlyingIn));
  return underlyingIn;
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
