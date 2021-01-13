export enum BalanceSheetErrors {
  InsufficientLockedCollateral = "ERR_INSUFFICIENT_LOCKED_COLLATERAL",
}

export enum GenericErrors {
  AccountNotUnderwater = "ERR_ACCOUNT_NOT_UNDERWATER",
}

export enum HifiFlashSwapErrors {
  InsufficientProfit = "ERR_INSUFFICIENT_PROFIT",
  UniswapV2PairCallNotAuthorized = "ERR_UNISWAP_V2_CALL_NOT_AUTHORIZED",
  WbtcAmountZero = "ERR_WBTC_AMOUNT_ZERO",
  WbtcTransfer = "ERR_WBTC_TRANSFER",
}
