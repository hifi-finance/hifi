/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

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

    /// @dev Returns how much underlying would be required to buy `fyTokenOut` fyTokens.
    /// @param fyTokenOut Amount of fyToken hypothetically desired.
    /// @return Amount of underlying hypothetically required.
    function getFyTokenQuote(uint256 fyTokenOut) public view virtual returns (uint256);

    /// @dev Returns how much fyToken would be required to buy `underlyingOut` underlying.
    /// @param underlyingOut Amount of underlying hypothetically desired.
    /// @return Amount of fyToken hypothetically required.
    function getUnderlyingQuote(uint256 underlyingOut) public view virtual returns (uint256);

    /// @notice Returns the "virtual" fyToken reserves.
    /// @dev The fyToken Erc20 balance gets added to the total supply of pool tokens.
    function getVirtualFyTokenReserves() public view virtual returns (uint256);

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
