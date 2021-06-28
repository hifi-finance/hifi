export enum HifiPoolErrors {
  BondMatured = "HifiPool__BondMatured",
  BurnZero = "HifiPool__BurnZero",
  BuyHTokenZero = "HifiPool__BuyHTokenZero",
  BuyUnderlyingZero = "HifiPool__BuyUnderlyingZero",
  MintZero = "HifiPool__MintZero",
  NegativeInterestRate = "HifiPool__NegativeInterestRate",
  SellHTokenZero = "HifiPool__SellHTokenZero",
  SellUnderlyingZero = "HifiPool__SellUnderlyingZero",
  ToInt256CastOverflow = "HifiPool__ToInt256CastOverflow",
  VirtualHTokenReservesOverflow = "HifiPool__VirtualHTokenReservesOverflow",
}

export enum PRBMathUD60x18Errors {
  Exp2InputTooBig = "PRBMathUD60x18__Exp2InputTooBig",
  FromUintOverflow = "PRBMathUD60x18__FromUintOverflow",
}

export enum YieldSpaceErrors {
  HTokenOutForUnderlyingInReservesFactorsUnderflow = "YieldSpace__HTokenOutForUnderlyingInReservesFactorsUnderflow",
  HTokenReservesOverflow = "YieldSpace__HTokenReservesOverflow",
  HTokenReservesUnderflow = "YieldSpace__HTokenReservesUnderflow",
  LossyPrecisionUnderflow = "YieldSpace__LossyPrecisionUnderflow",
  TooFarFromMaturity = "YieldSpace__TooFarFromMaturity",
  UnderlyingOutForHTokenInReservesFactorsUnderflow = "YieldSpace__UnderlyingOutForHTokenInReservesFactorsUnderflow",
  UnderlyingReservesOverflow = "YieldSpace__UnderlyingReservesOverflow",
  UnderlyingReservesUnderflow = "YieldSpace__UnderlyingReservesUnderflow",
}
