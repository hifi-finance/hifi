export enum BalanceSheetErrors {
  LiquidateBorrowInsufficientCollateral = "BalanceSheet__LiquidateBorrowInsufficientCollateral",
  NoLiquidityShortfall = "BalanceSheet__NoLiquidityShortfall",
}

export enum HifiFlashUniswapV2Errors {
  CallNotAuthorized = "HifiFlashUniswapV2__CallNotAuthorized",
  FlashBorrowCollateral = "HifiFlashUniswapV2__FlashBorrowCollateral",
  InsufficientProfit = "HifiFlashUniswapV2__InsufficientProfit",
  UnderlyingNotInPool = "HifiFlashUniswapV2__UnderlyingNotInPool",
}
