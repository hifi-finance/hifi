import { BigNumber } from "@ethersproject/bignumber";
import fromExponential from "from-exponential";
import fp from "evm-fp";

export function bn(x: string): BigNumber {
  let xs: string = x;
  if (x.includes("e")) {
    xs = fromExponential(x);
  }
  return BigNumber.from(xs);
}

export function hUSDC(x: string): BigNumber {
  return fp(x, 18);
}

export function USDC(x: string): BigNumber {
  return fp(x, 6);
}
