// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

import "./IUniswapV2Pair.sol";

/// @title ICollateralFlashUniswapV2
/// @author Hifi
/// @notice Integration of Uniswap V2 flash swaps for liquidating underwater accounts in Hifi.
/// that are collateralized with non-underlying tokens.
interface ICollateralFlashUniswapV2 is IUniswapV2Callee {
    /// EVENTS ///

    event FlashSwapCollateralAndLiquidateBorrow(
        address indexed liquidator,
        address indexed borrower,
        address indexed bond,
        uint256 underlyingAmount,
        uint256 seizedCollateralAmount,
        uint256 profitCollateralAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice The unique BalanceSheet contract associated with this contract.
    function balanceSheet() external view returns (IBalanceSheetV1);

    /// @notice Calculates the amount of collateral that must be repaid to Uniswap. The formula applied is:
    ///
    ///                         (collateralReserves * underlyingAmount) * 1000
    /// repayCollateralAmount =  --------------------------------------------
    ///                            (usdcReserves - underlyingAmount) * 997
    ///
    /// @dev See "getAmountIn" and "getAmountOut" in UniswapV2Library.sol. Flash swaps that are repaid via the
    /// corresponding pair token is akin to a normal swap, so the 0.3% LP fee applies.
    /// @param pair The Uniswap V2 pair contract.
    /// @param underlying The address of the underlying contract.
    /// @param underlyingAmount The amount of underlying flash borrowed.
    /// @return repayCollateralAmount The minimum amount of collateral that must be repaid.
    function getRepayCollateralAmount(
        IUniswapV2Pair pair,
        IErc20 underlying,
        uint256 underlyingAmount
    ) external view returns (uint256 repayCollateralAmount);

    /// @notice The address of the UniswapV2Factory contract.
    function uniV2Factory() external view returns (address);

    /// @notice The init code hash of the UniswapV2Pair contract.
    function uniV2PairInitCodeHash() external view returns (bytes32);
}
