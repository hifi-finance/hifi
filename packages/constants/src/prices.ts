import { BigNumber } from "@ethersproject/bignumber";
import fp from "evm-fp";

export const NORMALIZED_USDC_PRICE: BigNumber = fp("1");
export const NORMALIZED_WBTC_PRICE: BigNumber = fp("50000");
export const NORMALIZED_WETH_PRICE: BigNumber = fp("2000");

export const WBTC_PRICE: BigNumber = fp("50000", 8);
