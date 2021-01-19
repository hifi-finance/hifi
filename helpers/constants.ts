import { BigNumber } from "@ethersproject/bignumber";

export const chainlinkPricePrecision: BigNumber = BigNumber.from(8);

export const fyTokenConstants = {
  decimals: 18,
};

export const mainnetAddresses: { [name: string]: string } = {
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "UNI-V2-WBTC-USDC": "0x004375Dff511095CC5A197A54140a24eFEF3A416",
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  UniswapV2Router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
};

export const ten: BigNumber = BigNumber.from(10);

export const usdcConstants = {
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
};

export const wbtcConstants = {
  decimals: 8,
  name: "Wrapped BTC",
  symbol: "WBTC",
};
