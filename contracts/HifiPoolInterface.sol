/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "./HifiPoolStorage.sol";

/// @title HifiPoolInterface
/// @author Hifi
abstract contract HifiPoolInterface is HifiPoolStorage {
    /// EVENTS ///

    event AddLiquidity(
        uint256 maturity,
        address indexed provider,
        uint256 underlyingAmount,
        uint256 fyTokenAmount,
        uint256 poolTokenAmount
    );

    event RemoveLiquidity(
        uint256 maturity,
        address indexed provider,
        uint256 underlyingAmount,
        uint256 fyTokenAmount,
        uint256 poolTokenAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice Quotes how much fyToken would be obtained by selling `underlyingIn` underlying.
    /// @param underlyingIn Hypothetical amount of underlying to sell.
    /// @return fyTokenOut Hypothetical amount of fyToken that would be bought.
    function getQuoteForSellingUnderlying(int256 underlyingIn) external view virtual returns (int256 fyTokenOut);

    /// @dev Quotes how much underlying would be obtained by selling `fyDaiIn` fyToken.
    /// @param fyTokenIn Hypothetical amount of fyToken to sell.
    /// @return underlyingOut Hypothetical amount of underlying that would be bought.
    function getQuoteForSellingFyToken(int256 fyTokenIn) external view virtual returns (int256 underlyingOut);

    /// @notice Returns the "virtual" fyToken reserves.
    /// @dev The fyToken Erc20 balance gets added to the total supply of pool tokens.
    function getVirtualFyTokenReserves() external view virtual returns (int256);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Burn liquidity tokens in exchange for underlying tokens and fyTokens.
    ///
    /// @dev Emits a {RemoveLiquidity} event.
    ///
    /// Requirements:
    ///
    /// - The amount to burn cannot be zero.
    /// - The caller must have allowed this contract to spend `poolTokensBurned`.
    ///
    /// @param poolTokensBurned Amount of liquidity tokens to burn.
    /// @return The amount of reserve tokens returned (underlying tokens, fyToken).
    function burn(uint256 poolTokensBurned) external virtual returns (uint256, uint256);

    /// @notice Mints liquidity tokens in exchange for adding underlying tokens and fyTokens. An appropriate amount of
    /// fyTokens gets calculated and taken from the caller to be investigated alongside underlying tokens.
    ///
    /// @dev Emits an {AddLiquidity} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingOffered` and `fyTokenRequired` tokens.
    ///
    /// @param underlyingOffered Amount of underlying tokens invested.
    /// @return The amount of liquidity tokens to mint.
    function mint(uint256 underlyingOffered) external virtual returns (uint256);
}
