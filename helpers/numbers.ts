import { BigNumber, parseFixed } from "@ethersproject/bignumber";
import fromExponential from "from-exponential";

export function fp(x: string): BigNumber {
  // Check if x is either a whole number with up to 60 digits or a fixed-point number with up to 60 digits and up to 18 decimals.
  if (!/^[-+]?(\d{1,60}|(?=\d+\.\d+)\d{1,60}\.\d{1,18})$/.test(x)) {
    throw new Error(`Unknown format for fixed-point number: ${x}`);
  }

  const precision: number = 18;
  return parseFixed(x, precision);
}

export function fps(x: string): BigNumber {
  // Check if the input is in scientific notation.
  if (!/^(-?\d+)(\.\d+)?(e|e-)(\d+)$/.test(x)) {
    throw new Error(`Unknown format for fixed-point number in scientific notation: ${x}`);
  }

  const precision: number = 18;
  return parseFixed(fromExponential(x), precision);
}
