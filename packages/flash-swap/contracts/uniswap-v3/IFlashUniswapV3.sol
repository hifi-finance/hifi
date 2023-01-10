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

    /// @notice Emitted when the liquidation either does not yield a sufficient profit or it costs more
    /// than what the subsidizer is willing to pay.
    error FlashUniswapV3__TurnoutNotSatisfied(uint256 seizeAmount, uint256 sellAmount, int256 turnout);

    /// @notice Emitted when neither the token0 nor the token1 is the underlying.
    error FlashUniswapV3__UnderlyingNotInPool(address pool, address token0, address token1, address underlying);

    /// EVENTS ///

    /// @notice Emitted when a flash loan is made and an account is liquidated.
    /// @param liquidator The address of the liquidator account.
    /// @param borrower The address of the borrower account being liquidated.
    /// @param bond The address of the hToken contract.
    /// @param underlyingAmount The amount of underlying flash borrowed.
    /// @param seizeAmount The amount of collateral seized.
    /// @param sellAmount The amount of collateral sold.
    /// @param repayAmount The amount of underlying that had to be repaid by the liquidator.
    /// @param subsidyAmount The amount of collateral subsidized by the liquidator.
    /// @param profitAmount The amount of collateral pocketed as profit by the liquidator.
    event FlashLoanAndLiquidateBorrow(
        address indexed liquidator,
        address indexed borrower,
        address indexed bond,
        uint256 underlyingAmount,
        uint256 seizeAmount,
        uint256 sellAmount,
        uint256 repayAmount,
        uint256 subsidyAmount,
        uint256 profitAmount
    );

    /// STRUCTS ///

    struct FlashLiquidateParams {
        address borrower;
        IHToken bond;
        address collateral;
        uint24 poolFee;
        int256 turnout;
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
        int256 turnout;
        address underlying;
        uint256 underlyingAmount;
    }

    /// CONSTANT FUNCTIONS ///

    /// @notice The `BalanceSheet` contract.
    function balanceSheet() external view returns (IBalanceSheetV2);

    /// @notice The address of the UniswapV3Factory contract.
    function uniV3Factory() external view returns (address);

    /// @notice The address of the Uniswap V3 Quoter contract.
    function uniV3Quoter() external view returns (address);

    /// @notice The address of the Uniswap V3 SwapRouter contract.
    function uniV3SwapRouter() external view returns (address);

    /// NON-CONSTANT FUNCTIONS ///

    /// TODO: add NatSpec comments
    function flashLiquidate(FlashLiquidateParams memory params) external;
}
