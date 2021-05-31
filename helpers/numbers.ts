import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";
import fromExponential from "from-exponential";

export function bn(x: string): BigNumber {
  let xs: string = x;
  if (x.includes("e")) {
    xs = fromExponential(x);
  }
  return BigNumber.from(xs);
}

// The precision used in the prices reported by Chainlink is 8 decimals.
export function price(x: string): BigNumber {
  return fp(x, 8);
}

export function usdc(x: string): BigNumber {
  return fp(x, 6);
}

export function precisionScalarForDecimals(n: BigNumber): BigNumber {
  if (n.toNumber() > 18 || n.isNegative()) {
    throw new Error(`Invalid n given: ${n}`);
  }
  if (n.toNumber() === 18) {
    return bn("1");
  }
  return bn(`1e${18 - n.toNumber()}`);
}

export function wbtc(x: string): BigNumber {
  return fp(x, 8);
}

export function weth(x: string): BigNumber {
  return fp(x, 18);
}
