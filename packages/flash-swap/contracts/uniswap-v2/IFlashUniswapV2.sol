// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

import "./IUniswapV2Pair.sol";

/// @title IFlashUniswapV2
/// @author Hifi
/// @notice Integration of Uniswap V2 flash swaps for liquidating underwater accounts in Hifi.
interface IFlashUniswapV2 is IUniswapV2Callee {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the caller is not the Uniswap V2 pair contract.
    error FlashUniswapV2__CallNotAuthorized(address caller);

    /// @notice Emitted when the flash borrowed asset is the collateral instead of the underlying.
    error FlashUniswapV2__FlashBorrowCollateral(address collateral, address underlying);

    /// @notice Emitted when liquidating a vault backed by underlying.
    error FlashUniswapV2__LiquidateUnderlyingBackedVault(address borrower, address underlying);

    /// @notice Emitted when the liquidation either does not yield a sufficient profit or it costs more
    /// than what the subsidizer is willing to pay.
    error FlashUniswapV2__TurnoutNotSatisfied(uint256 seizeAmount, uint256 repayAmount, int256 turnout);

    /// @notice Emitted when neither the token0 nor the token1 is the underlying.
    error FlashUniswapV2__UnderlyingNotInPool(IUniswapV2Pair pair, address token0, address token1, IErc20 underlying);

    /// EVENTS ///

    /// @notice Emitted when a flash swap is made and an account is liquidated.
    /// @param liquidator The address of the liquidator account.
    /// @param borrower The address of the borrower account being liquidated.
    /// @param bond The address of the hToken contract.
    /// @param underlyingAmount The amount of underlying flash borrowed
    /// @param repayAmount The amount of collateral that had to be repaid by the liquidator.
    /// @param subsidyAmount The amount of collateral subsidized by the liquidator.
    /// @param profitAmount The amount of collateral pocketed as profit by the liquidator.
    event FlashSwapAndLiquidateBorrow(
        address indexed liquidator,
        address indexed borrower,
        address indexed bond,
        uint256 underlyingAmount,
        uint256 seizeAmount,
        uint256 repayAmount,
        uint256 subsidyAmount,
        uint256 profitAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice The `BalanceSheet` contract.
    function balanceSheet() external view returns (IBalanceSheetV2);

    /// @notice Calculates the amount of that must be repaid to Uniswap. When the collateral is not the underlying,
    /// The formula used is:
    ///
    ///                (collateralReserves * underlyingAmount) * 1000
    /// repayAmount = -----------------------------------------------
    ///                (underlyingReserves - underlyingAmount) * 997
    ///
    /// Otherwise, the formula is:
    ///
    ///               underlyingAmount * 1000
    /// repayAmount =  ---------------------
    ///                         997
    ///
    /// @dev See "getAmountIn" and "getAmountOut" in `UniswapV2Library`. Flash swaps that are repaid via the
    /// corresponding pair token are akin to a normal swap, so the 0.3% LP fee applies.
    /// @param pair The Uniswap V2 pair contract.
    /// @param underlying The address of the underlying contract.
    /// @param underlyingAmount The amount of underlying flash borrowed.
    /// @return repayAmount The minimum amount that must be repaid.
    function getRepayAmount(
        IUniswapV2Pair pair,
        IErc20 underlying,
        uint256 underlyingAmount
    ) external view returns (uint256 repayAmount);

    /// @notice The address of the UniswapV2Factory contract.
    function uniV2Factory() external view returns (address);

    /// @notice The init code hash of the UniswapV2Pair contract.
    function uniV2PairInitCodeHash() external view returns (bytes32);
}
