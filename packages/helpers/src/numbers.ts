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

export function hUSDC(x: string): BigNumber {
  return fp(x, 18);
}

// The precision used in the prices reported by Chainlink is 8 decimals.
export function price(x: string): BigNumber {
  return fp(x, 8);
}

export function getPrecisionScalar(decimals: BigNumber): BigNumber {
  if (decimals.toNumber() > 18 || decimals.isNegative()) {
    throw new Error(`Invalid number of decimals given: ${decimals}`);
  }
  if (decimals.toNumber() === 18) {
    return bn("1");
  }
  return bn(`1e${18 - decimals.toNumber()}`);
}

export function USDC(x: string): BigNumber {
  return fp(x, 6);
}

export function WBTC(x: string): BigNumber {
  return fp(x, 8);
}

export function WETH(x: string): BigNumber {
  return fp(x, 18);
}
