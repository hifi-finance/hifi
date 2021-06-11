export enum OwnableErrors {
  NotOwner = "NOT_OWNER",
}

export enum BalanceSheetErrors {
  BorrowDebtCeilingOverflow = "BORROW_DEBT_CEILING_OVERFLOW",
  BorrowMaxBounds = "BORROW_MAX_BONDS",
  BorrowNotAllowed = "BORROW_NOT_ALLOWED",
  BorrowZero = "BORROW_ZERO",
  DepositCollateralNotAllowed = "DEPOSIT_COLLATERAL_NOT_ALLOWED",
  DepositCollateralZero = "DEPOSIT_COLLATERAL_ZERO",
  LiquidateBorrowCollateralUnderflow = "LIQUIDATE_BORROW_COLLATERAL_UNDERFLOW",
  LiquidateBorrowNotAllowed = "LIQUIDATE_BORROW_NOT_ALLOWED",
  LiquidateBorrowNoLiquidityShortfall = "LIQUIDATE_BORROW_NO_LIQUIDITY_SHORTFALL",
  LiquidateBorrowSelf = "LIQUIDATE_BORROW_SELF",
  LiquidityShortfall = "LIQUIDITY_SHORTFALL",
  RepayBorrowInsufficientBalance = "REPAY_BORROW_INSUFFICIENT_BALANCE",
  RepayBorrowInsufficientDebt = "REPAY_BORROW_INSUFFICIENT_DEBT",
  RepayBorrowNotAllowed = "REPAY_BORROW_NOT_ALLOWED",
  RepayBorrowZero = "REPAY_BORROW_ZERO",
  SetOracleZeroAddress = "SET_ORACLE_ZERO_ADDRESS",
  WithdrawCollateralUnderflow = "WITHDRAW_COLLATERAL_UNDERFLOW",
  WithdrawCollateralZero = "WITHDRAW_COLLATERAL_ZERO",
}

export enum ChainlinkOperatorErrors {
  FeedIncorrectDecimals = "FEED_DECIMALS_MISMATCH",
  FeedNotSet = "FEED_NOT_SET",
  PriceZero = "PRICE_ZERO",
}

export enum FintrollerErrors {
  ListCollateralDecimalsOverflow = "LIST_COLLATERAL_DECIMALS_OVERFLOW",
  ListCollateralDecimalsZero = "LIST_COLLATERAL_DECIMALS_ZERO",
  SetCollateralizationRatioLowerBound = "SET_COLLATERALIZATION_RATIO_LOWER_BOUND",
  SetCollateralizationRatioUpperBound = "SET_COLLATERALIZATION_RATIO_UPPER_BOUND",
  SetDebtCeilingUnderflow = "SET_DEBT_CEILING_UNDERFLOW",
  SetDebtCeilingZero = "SET_DEBT_CEILING_ZERO",
  SetLiquidationIncentiveLowerBound = "SET_LIQUIDATION_INCENTIVE_LOWER_BOUND",
  SetLiquidationIncentiveUpperBound = "SET_LIQUIDATION_INCENTIVE_UPPER_BOUND",
}

export enum GenericErrors {
  BondMatured = "BOND_MATURED",
  BondNotListed = "BOND_NOT_LISTED",
  CollateralNotListed = "COLLATERAL_NOT_LISTED",
}

export enum HTokenErrors {
  BurnNotAuthorized = "BURN_NOT_AUTHORIZED",
  BurnZero = "BURN_ZERO",
  ConstructorExpirationTimePast = "HTOKEN_CONSTRUCTOR_EXPIRATION_TIME_PAST",
  ConstructorUnderlyingDecimalsOverflow = "HTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_OVERFLOW",
  ConstructorUnderlyingDecimalsZero = "HTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_ZERO",
  MintNotAuthorized = "MINT_NOT_AUTHORIZED",
  MintZero = "MINT_ZERO",
}
