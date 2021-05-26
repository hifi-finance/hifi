export enum AdminErrors {
  NotAdmin = "NOT_ADMIN",
}

export enum BalanceSheetErrors {
  ClutchCollateralNotAuthorized = "CLUTCH_COLLATERAL_NOT_AUTHORIZED",
  DecreaseVaultDebtNotAuthorized = "DECREASE_VAULT_DEBT_NOT_AUTHORIZED",
  DepositCollateralNotAllowed = "DEPOSIT_COLLATERAL_NOT_ALLOWED",
  DepositCollateralZero = "DEPOSIT_COLLATERAL_ZERO",
  FreeCollateralZero = "FREE_COLLATERAL_ZERO",
  GetClutchableCollateralZero = "GET_CLUTCHABLE_COLLATERAL_ZERO",
  GetHypotheticalCollateralizationRatioDebtZero = "GET_HYPOTHETICAL_COLLATERALIZATION_RATIO_DEBT_ZERO",
  IncreaseVaultDebtNotAuthorized = "INCREASE_VAULT_DEBT_NOT_AUTHORIZED",
  InsufficientFreeCollateral = "INSUFFICIENT_FREE_COLLATERAL",
  InsufficientLockedCollateral = "INSUFFICIENT_LOCKED_COLLATERAL",
  LockCollateralZero = "LOCK_COLLATERAL_ZERO",
  OpenVaultFyTokenInspection = "OPEN_VAULT_FYTOKEN_INSPECTION",
  WithdrawCollateralZero = "WITHDRAW_COLLATERAL_ZERO",
}

export enum ChainlinkOperatorErrors {
  FeedIncorrectDecimals = "FEED_INCORRECT_DECIMALS",
  FeedNotSet = "FEED_NOT_SET",
  FeedSet = "FEED_SET",
  PriceZero = "PRICE_ZERO",
}

export enum FintrollerErrors {
  ListBondFyTokenInspection = "LIST_BOND_FYTOKEN_INSPECTION",
  SetBondDebtCeilingUnderflow = "SET_BOND_DEBT_CEILING_UNDERFLOW",
  SetBondDebtCeilingZero = "SET_BOND_DEBT_CEILING_ZERO",
  SetBondCollateralizationRatioLowerBound = "SET_BOND_COLLATERALIZATION_RATIO_LOWER_BOUND",
  SetBondCollateralizationRatioUpperBound = "SET_BOND_COLLATERALIZATION_RATIO_UPPER_BOUND",
  SetBondLiquidationIncentiveLowerBound = "SET_BOND_LIQUIDATION_INCENTIVE_LOWER_BOUND",
  SetBondLiquidationIncentiveUpperBound = "SET_BOND_LIQUIDATION_INCENTIVE_UPPER_BOUND",
  SetOracleZeroAddress = "SET_ORACLE_ZERO_ADDRESS",
}

export enum FyTokenErrors {
  BorrowDebtCeilingOverflow = "BORROW_DEBT_CEILING_OVERFLOW",
  BorrowLockedCollateralZero = "BORROW_LOCKED_COLLATERAL_ZERO",
  BorrowNotAllowed = "BORROW_NOT_ALLOWED",
  BorrowZero = "BORROW_ZERO",
  BurnNotAuthorized = "BURN_NOT_AUTHORIZED",
  BurnZero = "BURN_ZERO",
  ConstructorCollateralDecimalsOverflow = "FYTOKEN_CONSTRUCTOR_COLLATERAL_DECIMALS_OVERFLOW",
  ConstructorCollateralDecimalsZero = "FYTOKEN_CONSTRUCTOR_COLLATERAL_DECIMALS_ZERO",
  ConstructorExpirationTimeNotValid = "FYTOKEN_CONSTRUCTOR_EXPIRATION_TIME_NOT_VALID",
  ConstructorUnderlyingDecimalsOverflow = "FYTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_OVERFLOW",
  ConstructorUnderlyingDecimalsZero = "FYTOKEN_CONSTRUCTOR_UNDERLYING_DECIMALS_ZERO",
  LiquidateBorrowNotAllowed = "LIQUIDATE_BORROW_NOT_ALLOWED",
  LiquidateBorrowSelf = "LIQUIDATE_BORROW_SELF",
  LiquidateBorrowZero = "LIQUIDATE_BORROW_ZERO",
  MintNotAuthorized = "MINT_NOT_AUTHORIZED",
  MintZero = "MINT_ZERO",
  RepayBorrowInsufficientBalance = "REPAY_BORROW_INSUFFICIENT_BALANCE",
  RepayBorrowInsufficientDebt = "REPAY_BORROW_INSUFFICIENT_DEBT",
  RepayBorrowNotAllowed = "REPAY_BORROW_NOT_ALLOWED",
  RepayBorrowZero = "REPAY_BORROW_ZERO",
  SetFintrollerInspection = "SET_FINTROLLER_INSPECTION",
}

export enum GenericErrors {
  AccountNotUnderwater = "ACCOUNT_NOT_UNDERWATER",
  BelowCollateralizationRatio = "BELOW_COLLATERALIZATION_RATIO",
  BondMatured = "BOND_MATURED",
  BondNotListed = "BOND_NOT_LISTED",
  BondNotMatured = "BOND_NOT_MATURED",
  NotInitialized = "NOT_INITALIZED",
  VaultOpen = "VAULT_OPEN",
  VaultNotOpen = "VAULT_NOT_OPEN",
}

export enum RedemptionPoolErrors {
  RedeemFyTokensInsufficientUnderlying = "REDEEM_FYTOKENS_INSUFFICIENT_UNDERLYING",
  RedeemFyTokensNotAllowed = "REDEEM_FYTOKENS_NOT_ALLOWED",
  RedeemFyTokensZero = "REDEEM_FYTOKENS_ZERO",
  SupplyUnderlyingNotAllowed = "SUPPLY_UNDERLYING_NOT_ALLOWED",
  SupplyUnderlyingZero = "SUPPLY_UNDERLYING_ZERO",
}
