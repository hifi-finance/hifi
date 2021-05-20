/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber as MathjsBigNumber, all, create } from "mathjs";

import { K } from "./constants";

const config = {
  number: "BigNumber",
  precision: 79,
};

const math = create(all, config)!;
const mbn = math.bignumber!;
const pow = math.pow!;

export function getYieldExponent(timeToMaturity: string, g: string): string {
  return mbn("1")
    .sub(mbn(K).mul(mbn(timeToMaturity)).mul(mbn(g)))
    .toString();
}

/// "s" comes from "starting", "d" comes from "delta."
/// Warning: "xd" can be negative.
export function yieldSpace(xs: string, ys: string, xd: string, exp: string): string {
  const xs1gt = <MathjsBigNumber>pow(mbn(xs), mbn(exp));
  const ys1gt = <MathjsBigNumber>pow(mbn(ys), mbn(exp));
  const x = <MathjsBigNumber>mbn(xs).add(mbn(xd));
  const x1gt = <MathjsBigNumber>pow(mbn(x), mbn(exp));
  const y = <MathjsBigNumber>pow(xs1gt.add(ys1gt).sub(x1gt), mbn("1").div(mbn(exp)));
  const yd = <MathjsBigNumber>y.sub(mbn(ys));
  return yd.toString();
}

export { mbn };
