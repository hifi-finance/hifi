export enum BalanceSheetErrors {
  BondMatured = "BalanceSheet__BondMatured",
  BorrowMaxBounds = "BalanceSheet__BorrowMaxBonds",
  BorrowNotAllowed = "BalanceSheet__BorrowNotAllowed",
  BorrowZero = "BalanceSheet__BorrowZero",
  CollateralCeilingOverflow = "BalanceSheet__CollateralCeilingOverflow",
  DebtCeilingOverflow = "BalanceSheet__DebtCeilingOverflow",
  DepositCollateralNotAllowed = "BalanceSheet__DepositCollateralNotAllowed",
  DepositCollateralZero = "BalanceSheet__DepositCollateralZero",
  LiquidateBorrowInsufficientCollateral = "BalanceSheet__LiquidateBorrowInsufficientCollateral",
  LiquidateBorrowNotAllowed = "BalanceSheet__LiquidateBorrowNotAllowed",
  LiquidateBorrowSelf = "BalanceSheet__LiquidateBorrowSelf",
  LiquidityShortfall = "BalanceSheet__LiquidityShortfall",
  NoLiquidityShortfall = "BalanceSheet__NoLiquidityShortfall",
  OracleZeroAddress = "BalanceSheet__OracleZeroAddress",
  RepayBorrowInsufficientBalance = "BalanceSheet__RepayBorrowInsufficientBalance",
  RepayBorrowInsufficientDebt = "BalanceSheet__RepayBorrowInsufficientDebt",
  RepayBorrowNotAllowed = "BalanceSheet__RepayBorrowNotAllowed",
  RepayBorrowZero = "BalanceSheet__RepayBorrowZero",
  WithdrawCollateralUnderflow = "BalanceSheet__WithdrawCollateralUnderflow",
  WithdrawCollateralZero = "BalanceSheet__WithdrawCollateralZero",
}

export enum ChainlinkOperatorErrors {
  DecimalsMismatch = "ChainlinkOperator__DecimalsMismatch",
  FeedNotSet = "ChainlinkOperator__FeedNotSet",
  PriceZero = "ChainlinkOperator__PriceZero",
}

export enum FintrollerErrors {
  BondNotListed = "Fintroller__BondNotListed",
  CollateralDecimalsOverflow = "Fintroller__CollateralDecimalsOverflow",
  CollateralDecimalsZero = "Fintroller__CollateralDecimalsZero",
  CollateralNotListed = "Fintroller__CollateralNotListed",
  CollateralizationRatioOverflow = "Fintroller__CollateralizationRatioOverflow",
  CollateralizationRatioUnderflow = "Fintroller__CollateralizationRatioUnderflow",
  DebtCeilingUnderflow = "Fintroller__DebtCeilingUnderflow",
  LiquidationIncentiveOverflow = "Fintroller__LiquidationIncentiveOverflow",
  LiquidationIncentiveUnderflow = "Fintroller__LiquidationIncentiveUnderflow",
}

export enum HTokenErrors {
  BondNotMatured = "HToken__BondNotMatured",
  BurnNotAuthorized = "HToken__BurnNotAuthorized",
  MaturityPast = "HToken__MaturityPast",
  MintNotAuthorized = "HToken__MintNotAuthorized",
  RedeemInsufficientLiquidity = "HToken__RedeemInsufficientLiquidity",
  RedeemZero = "HToken__RedeemZero",
  SupplyUnderlyingZero = "HToken__SupplyUnderlyingZero",
  UnderlyingDecimalsZero = "HToken__UnderlyingDecimalsZero",
  UnderlyingDecimalsOverflow = "HToken__UnderlyingDecimalsOverflow",
}

export enum OwnableErrors {
  NotOwner = "Ownable__NotOwner",
}

export enum OwnableUpgradeableErrors {
  NotOwner = "OwnableUpgradeable__NotOwner",
}
