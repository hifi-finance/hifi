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
  BelowCollateralizationRatio = "ERR_BELOW_COLLATERALIZATION_RATIO",
  BondMatured = "ERR_BOND_MATURED",
  BondNotMatured = "ERR_BOND_NOT_MATURED",
  DepositNotAllowed = "ERR_DEPOSIT_NOT_ALLOWED",
  FreeCollateralInsufficientLockedCollateral = "ERR_FREE_COLLATERAL_INSUFFICIENT_LOCKED_COLLATERAL",
  LockCollateralInsufficientFreeCollateral = "ERR_LOCK_COLLATERAL_INSUFFICIENT_FREE_COLLATERAL",
  MintNotAllowed = "ERR_MINT_NOT_ALLOWED",
  VaultNotOpen = "ERR_VAULT_NOT_OPEN",
}
