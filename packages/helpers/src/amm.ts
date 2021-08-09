import { BigNumber } from "@ethersproject/bignumber";

import { getHTokenName, getHTokenSymbol } from "./protocol";

export function getHifiPoolName(maturity: BigNumber, prefix: string = "Hifi USDC"): string {
  return getHTokenName(maturity, prefix);
}

export function getHifiPoolSymbol(maturity: BigNumber, prefix: string = "hUSDC"): string {
  return getHTokenSymbol(maturity, prefix);
}
