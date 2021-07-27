// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/hToken/IHToken.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";

/// @title IHifiPool
/// @author Hifi
interface IHifiPool {
    /// EVENTS ///

    event AddLiquidity(
        uint256 maturity,
        address indexed provider,
        uint256 underlyingAmount,
        uint256 hTokenAmount,
        uint256 poolTokenAmount
    );

    event RemoveLiquidity(
        uint256 maturity,
        address indexed provider,
        uint256 underlyingAmount,
        uint256 hTokenAmount,
        uint256 poolTokenAmount
    );

    event Trade(
        uint256 maturity,
        address indexed from,
        address indexed to,
        int256 underlyingAmount,
        int256 hTokenAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice Quotes how much underlying would be required to buy `hTokenOut` hToken.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param hTokenOut Hypothetical amount of hToken to sell.
    /// @return underlyingIn Hypothetical amount of underlying required.
    function getQuoteForBuyingHToken(uint256 hTokenOut) external view returns (uint256 underlyingIn);

    /// @notice Quotes how much hToken would be required to buy `underlyingOut` underlying.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param underlyingOut Hypothetical amount of underlying desired.
    /// @return hTokenIn Hypothetical amount of hToken required.
    function getQuoteForBuyingUnderlying(uint256 underlyingOut) external view returns (uint256 hTokenIn);

    /// @notice Quotes how much underlying would be obtained by selling `hTokenIn` hToken.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param hTokenIn Hypothetical amount of hToken to sell.
    /// @return underlyingOut Hypothetical amount of underlying that would be obtained.
    function getQuoteForSellingHToken(uint256 hTokenIn) external view returns (uint256 underlyingOut);

    /// @notice Quotes how much hToken would be obtained by selling `underlyingIn` underlying.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param underlyingIn Hypothetical amount of underlying to sell.
    /// @return hTokenOut Hypothetical amount of hToken that would be obtained.
    function getQuoteForSellingUnderlying(uint256 underlyingIn) external view returns (uint256 hTokenOut);

    /// @notice Retrieves the normalized underlying reserves, i.e. the Erc20 balance scaled to have 18 decimals.
    function getNormalizedUnderlyingReserves() external view returns (uint256 normalizedUnderlyingReserves);

    /// @notice Retrieves the "" hToken reserves, as explained in the whitepaper.
    /// @dev Adds the Erc20 hToken balance to the total supply of pool tokens.
    function getVirtualHTokenReserves() external view returns (uint256 virtualHTokenReserves);

    /// @notice Quotes how much hToken would be required by mint function for `underlyingOffered` underlying.
    /// and Quotes how much  pool Tokens  would be obtained.
    ///
    /// @param underlyingOffered Amount of underlying tokens invested.
    /// @return hTokenRequired Hypothetical amount of hTokens required by mint.
    /// @return poolTokensMinted The amount of liquidity tokens to mint.
    function getRequiredHTokenAndReturnedPoolTokenQuoteForMint(uint256 underlyingOffered)
        external
        view
        returns (uint256 hTokenRequired, uint256 poolTokensMinted);

    /// @notice The unix timestamp at which the hToken expires.
    function maturity() external view returns (uint256);

    /// @notice The hToken traded in this pool.
    function hToken() external view returns (IHToken);

    /// @notice The underlying token traded in this pool.
    function underlying() external view returns (IErc20);

    /// @notice The ratio between our native precision (18) and the underlying precision.
    function underlyingPrecisionScalar() external view returns (uint256);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Burn liquidity tokens in exchange for underlying tokens and hTokens.
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
    /// @return hTokenReturned The amount of reserve hToken retrieved.
    function burn(uint256 poolTokensBurned) external returns (uint256 underlyingReturned, uint256 hTokenReturned);

    /// @notice Buys hToken with underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForBuyingHToken".
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` underlying in their account.
    ///
    /// @param to Account that receives the hToken being bought.
    /// @param hTokenOut Amount of hToken being bought that will be transferred to the `to` account.
    /// @return underlyingIn Amount of underlying that will be taken from the caller's account.
    function buyHToken(address to, uint256 hTokenOut) external returns (uint256 underlyingIn);

    /// @notice Buys underlying with hToken.
    ///
    /// Requirements:
    /// - All from "getQuoteForBuyingUnderlying".
    /// - The caller must have allowed this contract to spend `hTokenIn` tokens.
    /// - The caller must have at least `hTokenIn` hToken in their account.
    ///
    /// @param to Account that receives the underlying being bought.
    /// @param underlyingOut Amount of underlying being bought that will be transferred to the `to` account.
    /// @return hTokenIn Amount of hToken that will be taken from the caller's account.
    function buyUnderlying(address to, uint256 underlyingOut) external returns (uint256 hTokenIn);

    /// @notice Mints liquidity tokens in exchange for adding underlying tokens and hTokens. An appropriate amount of
    /// hTokens gets calculated and taken from the caller to be investigated alongside underlying tokens.
    ///
    /// @dev Emits an {AddLiquidity} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingOffered` and `hTokenRequired` tokens.
    ///
    /// @param underlyingOffered Amount of underlying tokens invested.
    /// @return poolTokensMinted The amount of liquidity tokens to mint.
    function mint(uint256 underlyingOffered) external returns (uint256 poolTokensMinted);

    /// @notice Sells hToken for underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForSellingHToken".
    /// - The caller must have allowed this contract to spend `hTokenIn` tokens.
    /// - The caller must have at least `underlyingIn` hToken in their account.
    ///
    /// @param to Account that receives the underlying being bought.
    /// @param hTokenIn Amount of underlying being sold that is taken from the caller's account.
    /// @return underlyingOut Amount of underlying that will be transferred to the `to` account.
    function sellHToken(address to, uint256 hTokenIn) external returns (uint256 underlyingOut);

    /// @notice Sells underlying for hToken.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForSellingUnderlying".
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` underlying in their account.
    ///
    /// @param to Account that receives the hToken being bought.
    /// @param underlyingIn Amount of underlying being sold that is taken from the caller's account.
    /// @return hTokenOut Amount of hTokenOut that will be transferred to the `to` account.
    function sellUnderlying(address to, uint256 underlyingIn) external returns (uint256 hTokenOut);
}
