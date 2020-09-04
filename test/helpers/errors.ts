export enum CarefulMathErrors {
  NoError = 0,
}

export enum Errors {
  NotAuthorized = "ERR_NOT_AUTHORIZED",
}

export enum FintrollerErrors {
  BondNotListed = "ERR_BOND_NOT_LISTED",
  SetCollateralizationRatioOverflow = "ERR_SET_COLLATERALIZATION_RATIO_OVERFLOW",
  SetCollateralizationRatioUnderflow = "ERR_SET_COLLATERALIZATION_RATIO_UNDERFLOW",
  SetOracleZeroAddress = "ERR_SET_ORACLE_ZERO_ADDRESS",
}

export enum YTokenErrors {
  BelowThresholdCollateralizationRatio = "ERR_BELOW_THRESHOLD_COLLATERALIZATION_RATIO",
  BondMatured = "ERR_BOND_MATURED",
  BondNotMatured = "ERR_BOND_NOT_MATURED",
  BorrowInsufficientLiquidity = "ERR_REDEEM_INSUFFICIENT_LIQUIDITY",
  BorrowNotAllowed = "ERR_BORROW_NOT_ALLOWED",
  BorrowZero = "ERR_BORROW_ZERO",
  DepositCollateralZero = "ERR_DEPOSIT_COLLATERAL_ZERO",
  DepositCollateralNotAllowed = "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED",
  FreeCollateralInsufficientLockedCollateral = "ERR_FREE_COLLATERAL_INSUFFICIENT_LOCKED_COLLATERAL",
  FreeCollateralZero = "ERR_FREE_COLLATERAL_ZERO",
  LockCollateralInsufficientFreeCollateral = "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL",
  LockCollateralZero = "ERR_LOCK_COLLATERAL_ZERO",
  RedeemNotAllowed = "ERR_REDEEM_NOT_ALLOWED",
  RedeemZero = "ERR_REDEEM_ZERO",
  RepayBorrowInsufficientBalance = "ERR_REPAY_BORROW_INSUFFICIENT_BALANCE",
  RepayBorrowInsufficientDebt = "ERR_REPAY_BORROW_INSUFFICIENT_DEBT",
  RepayBorrowNotAllowed = "ERR_REPAY_BORROW_NOT_ALLOWED",
  RepayBorrowZero = "ERR_REPAY_BORROW_ZERO",
  VaultNotOpen = "ERR_VAULT_NOT_OPEN",
  WithdrawCollateralInsufficientFreeCollateral = "ERR_WITHDRAW_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL",
  WithdrawCollateralZero = "ERR_WITHDRAW_COLLATERAL_ZERO",
}
