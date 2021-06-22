// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

/// @notice Emitted when buying hTokens and the resultant hToken reserves would be too low.
error BuyHTokenInsufficientResultantReserves(uint256 hTokenReserves, uint256 normalizedUnderlyingReserves);

/// @notice Emitted when attempting to buy a zero amount of hTokens.
error BuyHTokenZero();

/// @notice Emitted when attempting to buy a zero amount of underlying.
error BuyUnderlyingZero();

/// @notice Emitted when offerring zero underlying to mint lp tokens.
error BurnZero();

/// @notice Emitted when offerring zero underlying to mint lp tokens.
error MintZero();

/// @notice Emitted when selling hTokens and the resultant hToken reserves would be too low.
error SellHTokenInsufficientResultantReserves(uint256 startingReservesFactor, uint256 newHTokenReservesFactor);

/// @notice Emitted when attempting to sell a zero amount of hToken.
error SellHTokenZero();

/// @notice Emitted when attempting to sell a zero amount of underlying.
error SellUnderlyingZero();

/// @notice Emitted when there is not enough underlying in the pool for how much should go out.
error TooMuchUnderlyingOut(uint256 normalizedUnderlyingReserves, uint256 normalizedUnderlyingOut);
