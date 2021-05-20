/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "./interfaces/FyTokenLike.sol";

/// @title HifiPoolInterface
/// @author Hifi
interface IHifiPool {
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

    event Trade(
        uint256 maturity,
        address indexed from,
        address indexed to,
        int256 underlyingAmount,
        int256 fyTokenAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice Quotes how much underlying would be required to buy `fyTokenOut` fyToken.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param fyTokenOut Hypothetical amount of fyToken to sell.
    /// @return underlyingIn Hypothetical amount of underlying required.
    function getQuoteForBuyingFyToken(uint256 fyTokenOut) external view returns (uint256 underlyingIn);

    /// @notice Quotes how much fyToken would be required to buy `underlyingOut` underlying.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param underlyingOut Hypothetical amount of underlying desired.
    /// @return fyTokenIn Hypothetical amount of fyToken required.
    function getQuoteForBuyingUnderlying(uint256 underlyingOut) external view returns (uint256 fyTokenIn);

    /// @notice Quotes how much underlying would be obtained by selling `fyTokenIn` fyToken.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param fyTokenIn Hypothetical amount of fyToken to sell.
    /// @return underlyingOut Hypothetical amount of underlying that would be obtained.
    function getQuoteForSellingFyToken(uint256 fyTokenIn) external view returns (uint256 underlyingOut);

    /// @notice Quotes how much fyToken would be obtained by selling `underlyingIn` underlying.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param underlyingIn Hypothetical amount of underlying to sell.
    /// @return fyTokenOut Hypothetical amount of fyToken that would be obtained.
    function getQuoteForSellingUnderlying(uint256 underlyingIn) external view returns (uint256 fyTokenOut);

    /// @notice Retrieves the normalized underlying reserves, i.e. the Erc20 balance scaled to have 18 decimals.
    function getNormalizedUnderlyingReserves() external view returns (uint256 normalizedUnderlyingReserves);

    /// @notice Retrieves the "" fyToken reserves, as explained in the whitepaper.
    /// @dev Adds the Erc20 fyToken balance to the total supply of pool tokens.
    function getVirtualFyTokenReserves() external view returns (uint256 virtualFyTokenReserves);

    /// @notice The unix timestamp at which the fyToken expires.
    function maturity() external view returns (uint256);

    /// @notice The fyToken traded in this pool.
    function fyToken() external view returns (FyTokenLike);

    /// @notice The underlying token traded in this pool.
    function underlying() external view returns (IErc20);

    /// @notice The ratio between our native precision (18) and the underlying precision.
    function underlyingPrecisionScalar() external view returns (uint256);

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
    /// @return underlyingReturned The amount of reserve underlying retrieved.
    /// @return fyTokenReturned The amount of reserve fyToken retrieved.
    function burn(uint256 poolTokensBurned) external returns (uint256 underlyingReturned, uint256 fyTokenReturned);

    /// @notice Buys fyToken with underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForBuyingFyToken".
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` underlying in their account.
    ///
    /// @param to Account that receives the fyToken being bought.
    /// @param fyTokenOut Amount of fyToken being bought that will be transferred to the `to` account.
    /// @return underlyingIn Amount of underlying that will be taken from the caller's account.
    function buyFyToken(address to, uint256 fyTokenOut) external returns (uint256 underlyingIn);

    /// @notice Buys underlying with fyToken.
    ///
    /// Requirements:
    /// - All from "getQuoteForBuyingUnderlying".
    /// - The caller must have allowed this contract to spend `fyTokenIn` tokens.
    /// - The caller must have at least `fyTokenIn` fyToken in their account.
    ///
    /// @param to Account that receives the underlying being bought.
    /// @param underlyingOut Amount of underlying being bought that will be transferred to the `to` account.
    /// @return fyTokenIn Amount of fyToken that will be taken from the caller's account.
    function buyUnderlying(address to, uint256 underlyingOut) external returns (uint256 fyTokenIn);

    /// @notice Mints liquidity tokens in exchange for adding underlying tokens and fyTokens. An appropriate amount of
    /// fyTokens gets calculated and taken from the caller to be investigated alongside underlying tokens.
    ///
    /// @dev Emits an {AddLiquidity} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingOffered` and `fyTokenRequired` tokens.
    ///
    /// @param underlyingOffered Amount of underlying tokens invested.
    /// @return poolTokensMinted The amount of liquidity tokens to mint.
    function mint(uint256 underlyingOffered) external returns (uint256 poolTokensMinted);

    /// @notice Sells fyToken for underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForSellingFyToken".
    /// - The caller must have allowed this contract to spend `fyTokenIn` tokens.
    /// - The caller must have at least `underlyingIn` fyToken in their account.
    ///
    /// @param to Account that receives the underlying being bought.
    /// @param fyTokenIn Amount of underlying being sold that is taken from the caller's account.
    /// @return underlyingOut Amount of underlying that will be transferred to the `to` account.
    function sellFyToken(address to, uint256 fyTokenIn) external returns (uint256 underlyingOut);

    /// @notice Sells underlying for fyToken.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForSellingUnderlying".
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` underlying in their account.
    ///
    /// @param to Account that receives the fyToken being bought.
    /// @param underlyingIn Amount of underlying being sold that is taken from the caller's account.
    /// @return fyTokenOut Amount of fyTokenOut that will be transferred to the `to` account.
    function sellUnderlying(address to, uint256 underlyingIn) external returns (uint256 fyTokenOut);
}
