// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

/// @notice Emitted when the bond matured.
error BondMatured();

/// @notice Emitted when buying hTokens and the resultant hToken reserves would be too low.
error BuyHTokenInsufficientResultantReserves(
    uint256 virtualHTokenReserves,
    uint256 hTokenOut,
    uint256 normalizedUnderlyingReserves,
    uint256 normalizedUnderlyingIn
);

/// @notice Emitted when attempting to buy a zero amount of hTokens.
error BuyHTokenZero();

/// @notice Emitted when attempting to buy a zero amount of underlying.
error BuyUnderlyingZero();

/// @notice Emitted when offerring zero underlying to mint lp tokens.
error BurnZero();

/// @notice Emitted when offerring zero underlying to mint lp tokens.
error MintZero();

/// @notice Emitted when attempting to use an underlying token with 0 or >18 decimals.
error HifiPoolConstructorUnderlyingDecimals(uint256 decimals);

/// @notice Emitted when selling underlying and the resultant hToken reserves would be too low.
error HTokenOutForUnderlyingInReservesFactorsUnderflow(
    uint256 startingReservesFactor,
    uint256 newNormalizedUnderlyingReservesFactor
);

/// @notice Emitted when the hToken reserves added to the hToken out overflows uint256.
error HTokenReservesOverflow(uint256 hTokenReserves, uint256 hTokenIn);

/// @notice Emitted when there is not enough hTokens in the pool for how much should go out.
error HTokenReservesUnderflow(uint256 hTokenReserves, uint256 hTokenOut);

/// @notice Emitted when the math calculations produce an underflow that in a pure mathematical sense
/// should not exist.
error LossyPrecisionUnderflow(uint256 minuend, uint256 subtrahend);

/// @notice Emitted when attempting to sell a zero amount of hToken.
error SellHTokenZero();

/// @notice Emitted when selling underlying and resultant hToken reserves would be too low.
error SellUnderlyingInsufficientResultantReserves(
    uint256 virtualHTokenReserves,
    uint256 hTokenOut,
    uint256 normalizedUnderlyingReserves,
    uint256 normalizedUnderlyingIn
);

/// @notice Emitted when attempting to sell a zero amount of underlying.
error SellUnderlyingZero();

/// @notice Emitted when trying to convert a uint256 number that doesn't fit within int256.
error ToInt256CastOverflow(uint256 number);

/// @notice Emitted when the time to maturity is beyond the cut-off point.
error TooFarFromMaturity(uint256 timeToMaturity);

/// @notice Emitted when selling underlying and the resultant hToken reserves would be too low.
error UnderlyingOutForHTokenInReservesFactorsUnderflow(uint256 startingReservesFactor, uint256 newHTokenReservesFactor);

/// @notice Emitted when the normalized underlying reserves added to the normalized underlying in overflows uint256.
error UnderlyingReservesOverflow(uint256 normalizedUnderlyingReserves, uint256 normalizedUnderlyingIn);

/// @notice Emitted when there is not enough underlying in the pool for how much should go out.
error UnderlyingReservesUnderflow(uint256 normalizedUnderlyingReserves, uint256 normalizedUnderlyingOut);

/// @notice Emitted when the hToken balance added to the total supply of LP tokens overflows uint256.
error VirtualHTokenReservesOverflow(uint256 hTokenBalance, uint256 totalSupply);
