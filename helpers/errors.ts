export enum AdminErrors {
  NotAdmin = "NOT_ADMIN",
}

export enum BalanceSheetErrors {
  ClutchCollateralNotAuthorized = "ERR_CLUTCH_COLLATERAL_NOT_AUTHORIZED",
  DecreaseVaultDebtNotAuthorized = "ERR_DECREASE_VAULT_DEBT_NOT_AUTHORIZED",
  DepositCollateralNotAllowed = "ERR_DEPOSIT_COLLATERAL_NOT_ALLOWED",
  DepositCollateralZero = "ERR_DEPOSIT_COLLATERAL_ZERO",
  FreeCollateralZero = "ERR_FREE_COLLATERAL_ZERO",
  GetClutchableCollateralZero = "ERR_GET_CLUTCHABLE_COLLATERAL_ZERO",
  GetHypotheticalCollateralizationRatioDebtZero = "ERR_GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_DEBT_ZERO",
  IncreaseVaultDebtNotAuthorized = "ERR_INCREASE_VAULT_DEBT_NOT_AUTHORIZED",
  InsufficientFreeCollateral = "ERR_INSUFFICIENT_FREE_COLLATERAL",
  InsufficientLockedCollateral = "ERR_INSUFFICIENT_LOCKED_COLLATERAL",
  LockCollateralZero = "ERR_LOCK_COLLATERAL_ZERO",
  OpenVaultFyTokenInspection = "ERR_OPEN_VAULT_FYTOKEN_INSPECTION",
  WithdrawCollateralZero = "ERR_WITHDRAW_COLLATERAL_ZERO",
}

export enum ChainlinkOperatorErrors {
  FeedIncorrectDecimals = "ERR_FEED_INCORRECT_DECIMALS",
  FeedNotSet = "ERR_FEED_NOT_SET",
  FeedSet = "ERR_FEED_SET",
  PriceZero = "ERR_PRICE_ZERO",
}

export enum FintrollerErrors {
  ListBondFyTokenInspection = "ERR_LIST_BOND_FYTOKEN_INSPECTION",
  SetBondDebtCeilingUnderflow = "ERR_SET_BOND_DEBT_CEILING_UNDERFLOW",
  SetBondDebtCeilingZero = "ERR_SET_BOND_DEBT_CEILING_ZERO",
  SetBondCollateralizationRatioLowerBound = "ERR_SET_BOND_COLLATERALIZATION_RATIO_LOWER_BOUND",
  SetBondCollateralizationRatioUpperBound = "ERR_SET_BOND_COLLATERALIZATION_RATIO_UPPER_BOUND",
  SetBondLiquidationIncentiveLowerBound = "ERR_SET_BOND_LIQUIDATION_INCENTIVE_LOWER_BOUND",
  SetBondLiquidationIncentiveUpperBound = "ERR_SET_BOND_LIQUIDATION_INCENTIVE_UPPER_BOUND",
  SetOracleZeroAddress = "ERR_SET_ORACLE_ZERO_ADDRESS",
}

export enum FyTokenErrors {
  BorrowDebtCeilingOverflow = "ERR_BORROW_DEBT_CEILING_OVERFLOW",
  BorrowLockedCollateralZero = "ERR_BORROW_LOCKED_COLLATERAL_ZERO",
  BorrowNotAllowed = "ERR_BORROW_NOT_ALLOWED",
  BorrowZero = "ERR_BORROW_ZERO",
  BurnNotAuthorized = "ERR_BURN_NOT_AUTHORIZED",
  BurnZero = "ERR_BURN_ZERO",
  ConstructorCollateralDecimalsOverflow = "ERR_FYTOKEN_CONSTRUCTOR_COLLATERAL_DECIMALS_OVERFLOW",
  ConstructorCollateralDecimalsZero = "ERR_FYTOKEN_CONSTRUCTOR_COLLATERAL_DECIMALS_ZERO",
  ConstructorExpirationTimeNotValid = "ERR_FYTOKEN_CONSTRUCTOR_EXPIRATION_TIME_NOT_VALID",
  ConstructorUnderlyingDecimalsOverflow = "ERR_FYTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_OVERFLOW",
  ConstructorUnderlyingDecimalsZero = "ERR_FYTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_ZERO",
  LiquidateBorrowNotAllowed = "ERR_LIQUIDATE_BORROW_NOT_ALLOWED",
  LiquidateBorrowSelf = "ERR_LIQUIDATE_BORROW_SELF",
  LiquidateBorrowZero = "ERR_LIQUIDATE_BORROW_ZERO",
  MintNotAuthorized = "ERR_MINT_NOT_AUTHORIZED",
  MintZero = "ERR_MINT_ZERO",
  RepayBorrowInsufficientBalance = "ERR_REPAY_BORROW_INSUFFICIENT_BALANCE",
  RepayBorrowInsufficientDebt = "ERR_REPAY_BORROW_INSUFFICIENT_DEBT",
  RepayBorrowNotAllowed = "ERR_REPAY_BORROW_NOT_ALLOWED",
  RepayBorrowZero = "ERR_REPAY_BORROW_ZERO",
  SetFintrollerInspection = "ERR_SET_FINTROLLER_INSPECTION",
}

export enum GenericErrors {
  AccountNotUnderwater = "ERR_ACCOUNT_NOT_UNDERWATER",
  BelowCollateralizationRatio = "ERR_BELOW_COLLATERALIZATION_RATIO",
  BondMatured = "ERR_BOND_MATURED",
  BondNotListed = "ERR_BOND_NOT_LISTED",
  BondNotMatured = "ERR_BOND_NOT_MATURED",
  NotInitialized = "ERR_NOT_INITALIZED",
  VaultOpen = "ERR_VAULT_OPEN",
  VaultNotOpen = "ERR_VAULT_NOT_OPEN",
}

export enum RedemptionPoolErrors {
  RedeemFyTokensInsufficientUnderlying = "ERR_REDEEM_FYTOKENS_INSUFFICIENT_UNDERLYING",
  RedeemFyTokensNotAllowed = "ERR_REDEEM_FYTOKENS_NOT_ALLOWED",
  RedeemFyTokensZero = "ERR_REDEEM_FYTOKENS_ZERO",
  SupplyUnderlyingNotAllowed = "ERR_SUPPLY_UNDERLYING_NOT_ALLOWED",
  SupplyUnderlyingZero = "ERR_SUPPLY_UNDERLYING_ZERO",
}
