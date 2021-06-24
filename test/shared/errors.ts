enum Errors {
  BondMatured = "BondMatured",
  BurnZero = "BurnZero",
  BuyHTokenZero = "BuyHTokenZero",
  BuyUnderlyingZero = "BuyUnderlyingZero",
  HifiPoolConstructorUnderlyingDecimals = "HifiPoolConstructorUnderlyingDecimals",
  HTokenOutForUnderlyingInReservesFactorsUnderflow = "HTokenOutForUnderlyingInReservesFactorsUnderflow",
  HTokenReservesOverflow = "HTokenReservesOverflow",
  HTokenReservesUnderflow = "HTokenReservesUnderflow",
  LossyPrecisionUnderflow = "LossyPrecisionUnderflow",
  MintZero = "MintZero",
  NegativeInterestRate = "NegativeInterestRate",
  SellHTokenZero = "SellHTokenZero",
  ToInt256CastOverflow = "ToInt256CastOverflow",
  TooFarFromMaturity = "TooFarFromMaturity",
  UnderlyingOutForHTokenInReservesFactorsUnderflow = "UnderlyingOutForHTokenInReservesFactorsUnderflow",
  UnderlyingReservesOverflow = "UnderlyingReservesOverflow",
  UnderlyingReservesUnderflow = "UnderlyingReservesUnderflow",
  VirtualHTokenReservesOverflow = "VirtualHTokenReservesOverflow",
}

export default Errors;
