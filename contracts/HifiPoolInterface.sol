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

    event Trade(
        uint256 maturity,
        address indexed from,
        address indexed to,
        int256 underlyingAmount,
        int256 fyTokenAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @dev Quotes how much underlying would be obtained by selling `fyTokenIn` fyToken.
    /// @param fyTokenIn Hypothetical amount of fyToken to sell.
    /// @return underlyingOut Hypothetical amount of underlying that would be obtained.
    function getQuoteForSellingFyToken(int256 fyTokenIn) public view virtual returns (int256 underlyingOut);

    /// @notice Quotes how much fyToken would be obtained by selling `underlyingIn` underlying.
    /// @param underlyingIn Hypothetical amount of underlying to sell.
    /// @return fyTokenOut Hypothetical amount of fyToken that would be obtained.
    function getQuoteForSellingUnderlying(int256 underlyingIn) public view virtual returns (int256 fyTokenOut);

    /// @notice Quotes how much underlying would be required to buy `fyTokenOut` fyToken.
    /// @param fyTokenOut Hypothetical amount of fyToken to sell.
    /// @return underlyingIn Hypothetical amount of underlying required.
    function getQuoteForBuyingFyToken(int256 fyTokenOut) public view virtual returns (int256 underlyingIn);

    /// @notice Quotes how much fyToken would be required to buy `underlyingOut` underlying.
    /// @param underlyingOut Hypothetical amount of underlying desired.
    /// @return fyTokenIn Hypothetical amount of fyToken required.
    function getQuoteForBuyingUnderlying(int256 underlyingOut) public view virtual returns (int256 fyTokenIn);

    /// @notice Retrieves the Erc20 underlying balance.
    function getUnderlyingReserves() public view virtual returns (int256 underlyingReserves);

    /// @notice Retrieves the "virtual" fyToken reserves, as explained in the whitepaper.
    /// @dev Adds the Erc20 fyToken balance to the total supply of pool tokens.
    function getVirtualFyTokenReserves() public view virtual returns (int256 virtualFyTokenReserves);

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
    function burn(uint256 poolTokensBurned)
        external
        virtual
        returns (uint256 underlyingReturned, uint256 fyTokenReturned);

    /// @notice Buys fyToken with underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` underlying in their account.
    ///
    /// @param to Account that receives the fyToken being bought.
    /// @param fyTokenOut Amount of fyToken being bought that will be transferred to the `to` account.
    /// @return underlyingIn Amount of underlying that will be taken from the caller's account.
    function buyFyToken(address to, int256 fyTokenOut) external virtual returns (int256 underlyingIn);

    /// @notice Buys underlying with fyToken.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `fyTokenIn` tokens.
    /// - The caller must have at least `fyTokenIn` fyToken in their account.
    ///
    /// @param to Account that receives the underlying being bought.
    /// @param underlyingOut Amount of underlying being bought that will be transferred to the `to` account.
    /// @return fyTokenIn Amount of fyToken that will be taken from the caller's account.
    function buyUnderlying(address to, int256 underlyingOut) external virtual returns (int256 fyTokenIn);

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
    function mint(uint256 underlyingOffered) external virtual returns (uint256 poolTokensMinted);

    /// @notice Sells fyToken for underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `fyTokenIn` tokens.
    /// - The caller must have at least `underlyingIn` fyToken in their account.
    ///
    /// @param to Account that receives the underlying being bought.
    /// @param fyTokenIn Amount of underlying being sold that is taken from the caller's account.
    /// @return underlyingOut Amount of underlying that will be transferred to the `to` account.
    function sellFyToken(address to, int256 fyTokenIn) external virtual returns (int256 underlyingOut);

    /// @notice Sells underlying for fyToken.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` underlying in their account.
    ///
    /// @param to Account that receives the fyToken being bought.
    /// @param underlyingIn Amount of underlying being sold that is taken from the caller's account.
    /// @return fyTokenOut Amount of fyTokenOut that will be transferred to the `to` account.
    function sellUnderlying(address to, int256 underlyingIn) external virtual returns (int256 fyTokenOut);
}
