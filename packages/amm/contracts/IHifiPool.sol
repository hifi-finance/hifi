// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/h-token/IHToken.sol";
import "@prb/contracts/token/erc20/IErc20.sol";
import "@prb/contracts/token/erc20/IErc20Permit.sol";

/// @title IHifiPool
/// @author Hifi
interface IHifiPool is IErc20Permit {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the bond matured.
    error HifiPool__BondMatured();

    /// @notice Emitted when attempting to buy a zero amount of hTokens.
    error HifiPool__BuyHTokenZero();

    /// @notice Emitted when attempting to buy hTokens with a zero amount of underlying.
    error HifiPool__BuyHTokenUnderlyingZero();

    /// @notice Emitted when attempting to buy a zero amount of underlying.
    error HifiPool__BuyUnderlyingZero();

    /// @notice Emitted when offering zero underlying to mint LP tokens.
    error HifiPool__BurnZero();

    /// @notice Emitted when offering zero underlying to mint LP tokens.
    error HifiPool__MintZero();

    /// @notice Emitted when buying hTokens or selling underlying and the resultant hToken reserves would become
    /// smaller than the underlying reserves.
    error HifiPool__NegativeInterestRate(
        uint256 virtualHTokenReserves,
        uint256 hTokenOut,
        uint256 normalizedUnderlyingReserves,
        uint256 normalizedUnderlyingIn
    );

    /// @notice Emitted when attempting to sell a zero amount of hToken.
    error HifiPool__SellHTokenZero();

    /// @notice Emitted when attempting to sell hTokens in exchange for a zero amount of underlying.
    error HifiPool__SellHTokenUnderlyingZero();

    /// @notice Emitted when attempting to sell a zero amount of underlying.
    error HifiPool__SellUnderlyingZero();

    /// @notice Emitted when trying to convert a uint256 number that doesn't fit within int256.
    error HifiPool__ToInt256CastOverflow(uint256 number);

    /// @notice Emitted when the hToken balance added to the total supply of LP tokens overflows uint256.
    error HifiPool__VirtualHTokenReservesOverflow(uint256 hTokenBalance, uint256 totalSupply);

    /// EVENTS ///

    /// @notice Emitted when liquidity is added to the AMM.
    /// @param maturity The maturity of the hToken.
    /// @param provider The address of the liquidity provider.
    /// @param underlyingAmount The amount of underlying provided.
    /// @param hTokenAmount The amount of hTokens provided.
    /// @param poolTokenAmount The amount of pool tokens minted.
    event AddLiquidity(
        uint256 maturity,
        address indexed provider,
        uint256 underlyingAmount,
        uint256 hTokenAmount,
        uint256 poolTokenAmount
    );

    /// @notice Emitted when liquidity is removed from the AMM.
    /// @param maturity The maturity of the hToken.
    /// @param provider The address of the liquidity withdrawn.
    /// @param underlyingAmount The amount of underlying withdrawn.
    /// @param hTokenAmount The amount of hTokens provided.
    /// @param poolTokenAmount The amount of pool tokens burned.
    event RemoveLiquidity(
        uint256 maturity,
        address indexed provider,
        uint256 underlyingAmount,
        uint256 hTokenAmount,
        uint256 poolTokenAmount
    );

    /// @notice Emitted when a trade is made in the AMM.
    /// @param maturity The maturity of the hToken.
    /// @param from The account sending the tokens to the AMM.
    /// @param to The account receiving the tokens from the AMM.
    /// @param underlyingAmount The amount of underlying bought or sold.
    /// @param hTokenAmount The amount of hTokens bought or sold.
    event Trade(
        uint256 maturity,
        address indexed from,
        address indexed to,
        int256 underlyingAmount,
        int256 hTokenAmount
    );

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @notice Quotes how much underlying would be required to buy `hTokenOut` hToken.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param hTokenOut The hypothetical amount of hTokens to sell.
    /// @return underlyingIn The hypothetical amount of underlying required.
    function getQuoteForBuyingHToken(uint256 hTokenOut) external view returns (uint256 underlyingIn);

    /// @notice Quotes how many hTokens would be required to buy `underlyingOut` underlying.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param underlyingOut The hypothetical amount of underlying desired.
    /// @return hTokenIn The hypothetical amount of hTokens required.
    function getQuoteForBuyingUnderlying(uint256 underlyingOut) external view returns (uint256 hTokenIn);

    /// @notice Calculates how many hTokens would be required and how many LP tokens would be issued for a given
    /// amount of underlying invested.
    /// @param underlyingOffered The amount of underlying tokens invested.
    /// @return hTokenRequired The hypothetical amount of hTokens required to mint new LP tokens.
    /// @return poolTokensMinted The amount of LP tokens to mint.
    function getMintInputs(uint256 underlyingOffered)
        external
        view
        returns (uint256 hTokenRequired, uint256 poolTokensMinted);

    /// @notice Calculates how much underlying and hToken would be returned for a given amount of LP tokens.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @return underlyingReturned The amount of reserve underlying retrieved.
    /// @return hTokenReturned The amount of reserve hToken retrieved.
    function getBurnOutputs(uint256 poolTokensBurned)
        external
        view
        returns (uint256 underlyingReturned, uint256 hTokenReturned);

    /// @notice Quotes how much underlying would be obtained by selling `hTokenIn` hToken.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param hTokenIn The hypothetical amount of hTokens to sell.
    /// @return underlyingOut The hypothetical amount of underlying that would be obtained.
    function getQuoteForSellingHToken(uint256 hTokenIn) external view returns (uint256 underlyingOut);

    /// @notice Quotes how many hTokens would be obtained by selling `underlyingIn` underlying.
    ///
    /// @dev Requirements:
    /// - Cannot be called after maturity.
    ///
    /// @param underlyingIn The hypothetical amount of underlying to sell.
    /// @return hTokenOut The hypothetical amount of hTokens that would be obtained.
    function getQuoteForSellingUnderlying(uint256 underlyingIn) external view returns (uint256 hTokenOut);

    /// @notice Returns the normalized underlying reserves, i.e. the Erc20 balance scaled to have 18 decimals.
    function getNormalizedUnderlyingReserves() external view returns (uint256 normalizedUnderlyingReserves);

    /// @notice Returns the virtual hToken reserves, as explained in the whitepaper.
    /// @dev Adds the Erc20 hToken balance to the total supply of LP tokens.
    function getVirtualHTokenReserves() external view returns (uint256 virtualHTokenReserves);

    /// @notice The unix timestamp at which the hToken expires.
    function maturity() external view returns (uint256);

    /// @notice The hToken traded in this pool.
    function hToken() external view returns (IHToken);

    /// @notice The underlying token traded in this pool.
    function underlying() external view returns (IErc20);

    /// @notice The ratio between our native precision (18) and the underlying precision.
    function underlyingPrecisionScalar() external view returns (uint256);

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @notice Burns LP tokens in exchange for underlying tokens and hTokens.
    ///
    /// @dev Emits a {RemoveLiquidity} event.
    ///
    /// Requirements:
    /// - The amount to burn cannot be zero.
    ///
    /// @param poolTokensBurned The amount of LP tokens to burn.
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
    /// - The caller must have at least `underlyingIn` in their account.
    ///
    /// @param to The account that receives the hToken being bought.
    /// @param hTokenOut The amount of hTokens being bought that will be transferred to the `to` account.
    /// @return underlyingIn The amount of underlying that will be taken from the caller's account.
    function buyHToken(address to, uint256 hTokenOut) external returns (uint256 underlyingIn);

    /// @notice Buys underlying with hToken.
    ///
    /// Requirements:
    /// - All from "getQuoteForBuyingUnderlying".
    /// - The caller must have allowed this contract to spend `hTokenIn` tokens.
    /// - The caller must have at least `hTokenIn` in their account.
    ///
    /// @param to The account that receives the underlying being bought.
    /// @param underlyingOut The amount of underlying being bought that will be transferred to the `to` account.
    /// @return hTokenIn The amount of hTokens that will be taken from the caller's account.
    function buyUnderlying(address to, uint256 underlyingOut) external returns (uint256 hTokenIn);

    /// @notice Mints LP tokens in exchange for adding underlying tokens and hTokens. An appropriate amount of
    /// hTokens gets calculated and taken from the caller to be investigated alongside underlying tokens.
    ///
    /// @dev Emits an {AddLiquidity} event.
    ///
    /// Requirements:
    /// - The caller must have allowed this contract to spend `underlyingOffered` and `hTokenRequired` tokens.
    ///
    /// @param underlyingOffered The amount of underlying tokens invested.
    /// @return poolTokensMinted The amount of LP tokens to mint.
    function mint(uint256 underlyingOffered) external returns (uint256 poolTokensMinted);

    /// @notice Sells hToken for underlying.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForSellingHToken".
    /// - The caller must have allowed this contract to spend `hTokenIn` tokens.
    /// - The caller must have at least `hTokenIn` in their account.
    ///
    /// @param to The account that receives the underlying being bought.
    /// @param hTokenIn The amount of underlying being sold that is taken from the caller's account.
    /// @return underlyingOut The amount of underlying that will be transferred to the `to` account.
    function sellHToken(address to, uint256 hTokenIn) external returns (uint256 underlyingOut);

    /// @notice Sells underlying for hToken.
    ///
    /// @dev Emits a {Trade} event.
    ///
    /// Requirements:
    /// - All from "getQuoteForSellingUnderlying".
    /// - The caller must have allowed this contract to spend `underlyingIn` tokens.
    /// - The caller must have at least `underlyingIn` in their account.
    ///
    /// @param to The account that receives the hToken being bought.
    /// @param underlyingIn The amount of underlying being sold that is taken from the caller's account.
    /// @return hTokenOut The amount of hTokenOut that will be transferred to the `to` account.
    function sellUnderlying(address to, uint256 underlyingIn) external returns (uint256 hTokenOut);
}
