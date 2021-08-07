/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber as MathjsBigNumber, all, create } from "mathjs";

const config = {
  number: "BigNumber",
  precision: 79,
};

const math = create(all, config)!;
const mbn = math.bignumber!;
const pow = math.pow!;

export function add(x: string, y: string): string {
  return (<MathjsBigNumber>mbn(x).add(mbn(y))).toString();
}

export function div(x: string, y: string): string {
  return (<MathjsBigNumber>mbn(x).div(mbn(y))).toString();
}

export function sub(x: string, y: string): string {
  return (<MathjsBigNumber>mbn(x).sub(mbn(y))).toString();
}

export { math, mbn, pow };
