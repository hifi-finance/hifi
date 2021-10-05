import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { toBn } from "evm-bn";

export function hUSDC(x: string): BigNumber {
  return toBn(x, 18);
}

// The precision used in the prices reported by Chainlink is 8 decimals.
export function price(x: string): BigNumber {
  return toBn(x, 8);
}

export function getPrecisionScalar(decimals: BigNumberish): BigNumber {
  const decimalsBn = BigNumber.from(decimals);
  if (decimalsBn.gt(18) || decimalsBn.isNegative()) {
    throw new Error(`Invalid number of decimals given: ${decimals}`);
  }
  if (decimalsBn.eq(18)) {
    return BigNumber.from(1);
  }
  return BigNumber.from(10).pow(18 - decimalsBn.toNumber());
}

export function USDC(x: string): BigNumber {
  return toBn(x, 6);
}

export function WBTC(x: string): BigNumber {
  return toBn(x, 8);
}

export function WETH(x: string): BigNumber {
  return toBn(x, 18);
}
