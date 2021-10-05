import type { BigNumber } from "@ethersproject/bignumber";
import { toBn } from "evm-bn";

export const NORMALIZED_USDC_PRICE: BigNumber = toBn("1", 18);
export const NORMALIZED_WBTC_PRICE: BigNumber = toBn("50000", 18);
export const NORMALIZED_WETH_PRICE: BigNumber = toBn("2000", 18);

export const WBTC_PRICE: BigNumber = toBn("50000", 8);
