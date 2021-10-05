export enum HifiPoolErrors {
  BOND_MATURED = "HifiPool__BondMatured",
  BURN_ZERO = "HifiPool__BurnZero",
  BUY_H_TOKEN_ZERO = "HifiPool__BuyHTokenZero",
  BUY_UNDERLYING_ZERO = "HifiPool__BuyUnderlyingZero",
  MINT_ZERO = "HifiPool__MintZero",
  NEGATIVE_INTEREST_RATE = "HifiPool__NegativeInterestRate",
  SELL_H_TOKEN_ZERO = "HifiPool__SellHTokenZero",
  SELL_UNDERLYING_ZERO = "HifiPool__SellUnderlyingZero",
  TO_INT256_CAST_OVERFLOW = "HifiPool__ToInt256CastOverflow",
  VIRTUAL_H_TOKEN_RESERVES_OVERFLOW = "HifiPool__VirtualHTokenReservesOverflow",
}

export enum HifiPoolRegistryErrors {
  POOL_ALREADY_TRACKED = "HifiPoolRegistry__PoolAlreadyTracked",
  POOL_NOT_TRACKED = "HifiPoolRegistry__PoolNotTracked",
}

export enum YieldSpaceErrors {
  H_TOKEN_OUT_FOR_UNDERLYING_IN_RESERVES_FACTORS_UNDERFLOW = "YieldSpace__HTokenOutForUnderlyingInReservesFactorsUnderflow",
  H_TOKEN_RESERVES_OVERFLOW = "YieldSpace__HTokenReservesOverflow",
  H_TOKEN_RESERVES_UNDERFLOW = "YieldSpace__HTokenReservesUnderflow",
  LOSSY_PRECISION_UNDERFLOW = "YieldSpace__LossyPrecisionUnderflow",
  TOO_FAR_FROM_MATURITY = "YieldSpace__TooFarFromMaturity",
  UNDERLYING_OUT_FOR_H_TOKEN_IN_RESERVES_FACTORS_UNDERFLOW = "YieldSpace__UnderlyingOutForHTokenInReservesFactorsUnderflow",
  UNDERLYING_RESERVES_OVERFLOW = "YieldSpace__UnderlyingReservesOverflow",
  UNDERLYING_RESERVES_UNDERFLOW = "YieldSpace__UnderlyingReservesUnderflow",
}
