// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol";

import "./IUniswapV3Pool.sol";
import "./PoolAddress.sol";

/// @title IFlashUniswapV3
/// @author Hifi
/// @notice Integration of Uniswap V3 flash swaps for liquidating underwater accounts in Hifi.
interface IFlashUniswapV3 is IUniswapV3FlashCallback {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the caller is not the Uniswap V3 pool contract.
    error FlashUniswapV3__CallNotAuthorized(address caller);

    /// @notice Emitted when liquidating a vault backed by underlying.
    error FlashUniswapV3__LiquidateUnderlyingBackedVault(address borrower, address underlying);

    /// @notice Emitted when neither the token0 nor the token1 is the underlying.
    error FlashUniswapV3__UnderlyingNotInPool(address pool, address token0, address token1, address underlying);

    /// STRUCTS ///

    struct FlashLiquidateParams {
        address borrower;
        IHToken bond;
        address collateral;
        uint24 poolFee;
        uint256 underlyingAmount;
    }

    struct UniswapV3FlashCallbackParams {
        uint256 amount0;
        uint256 amount1;
        IHToken bond;
        address borrower;
        address collateral;
        PoolAddress.PoolKey poolKey;
        address sender;
        uint256 underlyingAmount;
    }

    /// CONSTANT FUNCTIONS ///

    /// @notice The `BalanceSheet` contract.
    function balanceSheet() external view returns (IBalanceSheetV2);

    /// @notice The address of the UniswapV3Factory contract.
    function uniV3Factory() external view returns (address);

    /// NON-CONSTANT FUNCTIONS ///

    /// TODO: add NatSpec comments
    function flashLiquidate(FlashLiquidateParams memory params) external;
}
