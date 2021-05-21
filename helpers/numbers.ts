import { BigNumber, parseFixed } from "@ethersproject/bignumber";
import fromExponential from "from-exponential";

export function bn(x: string): BigNumber {
  let xs: string = x;
  if (x.includes("e")) {
    xs = fromExponential(x);
  }
  return BigNumber.from(xs);
}

export function usdc(x: string): BigNumber {
  let xs = x;

  // Convert from exponential notation.
  if (xs.includes("e")) {
    xs = fromExponential(xs);
  }

  // Limit the number of decimals to 6.
  if (xs.includes(".")) {
    const parts: string[] = xs.split(".");
    parts[1] = parts[1].slice(0, 6);
    xs = parts[0] + "." + parts[1];
  }

  // Check if x is a whole number with up to 72 digits or a fixed-point number with up to 72 digits and up to 6 decimals.
  if (/^[-+]?(\d{1,72}|(?=\d+\.\d+)\d{1,72}\.\d{1,6})$/.test(xs)) {
    const precision: number = 6;
    return parseFixed(xs, precision);
  } else {
    throw new Error("Unknown format for fixed-point number: " + x);
  }
}
