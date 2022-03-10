export enum BalanceSheetErrors {
  BOND_MATURED = "BalanceSheet__BondMatured",
  BORROW_MAX_BONDS = "BalanceSheet__BorrowMaxBonds",
  BORROW_NOT_ALLOWED = "BalanceSheet__BorrowNotAllowed",
  BORROW_ZERO = "BalanceSheet__BorrowZero",
  COLLATERAL_CEILING_OVERFLOW = "BalanceSheet__CollateralCeilingOverflow",
  DEBT_CEILING_OVERFLOW = "BalanceSheet__DebtCeilingOverflow",
  DEPOSIT_COLLATERAL_NOT_ALLOWED = "BalanceSheet__DepositCollateralNotAllowed",
  DEPOSIT_COLLATERAL_ZERO = "BalanceSheet__DepositCollateralZero",
  FINTROLLER_ZERO_ADDRESS = "BalanceSheet__FintrollerZeroAddress",
  LIQUIDATE_BORROW_INSUFFICIENT_COLLATERAL = "BalanceSheet__LiquidateBorrowInsufficientCollateral",
  LIQUIDATE_BORROW_NOT_ALLOWED = "BalanceSheet__LiquidateBorrowNotAllowed",
  LIQUIDATE_BORROW_SELF = "BalanceSheet__LiquidateBorrowSelf",
  LIQUIDITY_SHORTFALL = "BalanceSheet__LiquidityShortfall",
  NO_LIQUIDITY_SHORTFALL = "BalanceSheet__NoLiquidityShortfall",
  ORACLE_ZERO_ADDRESS = "BalanceSheet__OracleZeroAddress",
  REPAY_BORROW_INSUFFICIENT_BALANCE = "BalanceSheet__RepayBorrowInsufficientBalance",
  REPAY_BORROW_INSUFFICIENT_DEBT = "BalanceSheet__RepayBorrowInsufficientDebt",
  REPAY_BORROW_NOT_ALLOWED = "BalanceSheet__RepayBorrowNotAllowed",
  REPAY_BORROW_ZERO = "BalanceSheet__RepayBorrowZero",
  WITHDRAW_COLLATERAL_UNDERFLOW = "BalanceSheet__WithdrawCollateralUnderflow",
  WITHDRAW_COLLATERAL_ZERO = "BalanceSheet__WithdrawCollateralZero",
}

export enum ChainlinkOperatorErrors {
  DECIMALS_MISMATCH = "ChainlinkOperator__DecimalsMismatch",
  FEED_NOT_SET = "ChainlinkOperator__FeedNotSet",
  PRICE_ZERO = "ChainlinkOperator__PriceZero",
}

export enum FintrollerErrors {
  BOND_NOT_LISTED = "Fintroller__BondNotListed",
  COLLATERAL_DECIMALS_OVERFLOW = "Fintroller__CollateralDecimalsOverflow",
  COLLATERAL_DECIMALS_ZERO = "Fintroller__CollateralDecimalsZero",
  COLLATERAL_NOT_LISTED = "Fintroller__CollateralNotListed",
  COLLATERAL_RATIO_OVERFLOW = "Fintroller__CollateralRatioOverflow",
  COLLATERAL_RATIO_UNDERFLOW = "Fintroller__CollateralRatioUnderflow",
  DEBT_CEILING_UNDERFLOW = "Fintroller__DebtCeilingUnderflow",
  LIQUIDATION_INCENTIVE_OVERFLOW = "Fintroller__LiquidationIncentiveOverflow",
  LIQUIDATION_INCENTIVE_UNDERFLOW = "Fintroller__LiquidationIncentiveUnderflow",
}

export enum HTokenErrors {
  BOND_MATURED = "HToken__BondMatured",
  BOND_NOT_MATURED = "HToken__BondNotMatured",
  BURN_NOT_AUTHORIZED = "HToken__BurnNotAuthorized",
  DEPOSIT_UNDERLYING_NOT_ALLOWED = "HToken__DepositUnderlyingNotAllowed",
  DEPOSIT_UNDERLYING_ZERO = "HToken__DepositUnderlyingZero",
  MATURITY_PASSED = "HToken__MaturityPassed",
  MINT_NOT_AUTHORIZED = "HToken__MintNotAuthorized",
  REDEEM_INSUFFICIENT_LIQUIDITY = "HToken__RedeemInsufficientLiquidity",
  REDEEM_UNDERLYING_ZERO = "HToken__RedeemUnderlyingZero",
  REDEEM_ZERO = "HToken__RedeemZero",
  UNDERLYING_DECIMALS_OVERFLOW = "HToken__UnderlyingDecimalsOverflow",
  UNDERLYING_DECIMALS_ZERO = "HToken__UnderlyingDecimalsZero",
  WITHDRAW_UNDERLYING_UNDERFLOW = "HToken__WithdrawUnderlyingUnderflow",
  WITHDRAW_UNDERLYING_ZERO = "HToken__WithdrawUnderlyingZero",
}

export enum OwnableUpgradeableErrors {
  NOT_OWNER = "OwnableUpgradeable__NotOwner",
  OWNER_ZERO_ADDRESS = "OwnableUpgradeable__OwnerZeroAddress",
}
