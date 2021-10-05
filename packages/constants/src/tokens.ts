import { BigNumber } from "@ethersproject/bignumber";

export const USDC_DECIMALS: BigNumber = BigNumber.from(6);
export const USDC_NAME: string = "USD Coin";
export const USDC_PRICE_PRECISION_SCALAR: BigNumber = BigNumber.from(1_000_000_000_000);
export const USDC_SYMBOL: string = "USDC";

export const WETH_DECIMALS: BigNumber = BigNumber.from(18);
export const WETH_NAME: string = "Wrapped Ether";
export const WETH_SYMBOL: string = "WETH";

export const WBTC_DECIMALS: BigNumber = BigNumber.from(8);
export const WBTC_SYMBOL: string = "WBTC";
export const WBTC_NAME: string = "Wrapped BTC";
export const WBTC_PRICE_PRECISION_SCALAR: BigNumber = BigNumber.from(10_000_000_000);
