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
  DepositNotAllowed = "ERR_DEPOSIT_NOT_ALLOWED",
  FreeCollateralInsufficient = "ERR_FREE_COLLATERAL_INSUFFICIENT",
  Matured = "ERR_MATURED",
  MintNotAllowed = "ERR_MINT_NOT_ALLOWED",
  NotMatured = "ERR_NOT_MATURED",
  VaultNotOpen = "ERR_VAULT_NOT_OPEN",
}
