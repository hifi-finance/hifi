enum Errors {
  BurnZero = "BurnZero",
  BuyHTokenInsufficientResultantReserves = "BuyHTokenInsufficientResultantReserves",
  BuyHTokenZero = "BuyHTokenZero",
  BuyUnderlyingZero = "BuyUnderlyingZero",
  HifiPoolConstructorUnderlyingDecimals = "HifiPoolConstructorUnderlyingDecimals",
  HTokenOutForUnderlyingInReservesFactorsUnderflow = "HTokenOutForUnderlyingInReservesFactorsUnderflow",
  HTokenReservesOverflow = "HTokenReservesOverflow",
  HTokenReservesUnderflow = "HTokenReservesUnderflow",
  LossyPrecisionUnderflow = "LossyPrecisionUnderflow",
  MintZero = "MintZero",
  SellHTokenZero = "SellHTokenZero",
  ToInt256CastOverflow = "ToInt256CastOverflow",
  TooFarFromMaturity = "TooFarFromMaturity",
  UnderlyingOutForHTokenInReservesFactorsUnderflow = "UnderlyingOutForHTokenInReservesFactorsUnderflow",
  UnderlyingReservesOverflow = "UnderlyingReservesOverflow",
  UnderlyingReservesUnderflow = "UnderlyingReservesUnderflow",
  VirtualHTokenReservesOverflow = "VirtualHTokenReservesOverflow",
}

export default Errors;
