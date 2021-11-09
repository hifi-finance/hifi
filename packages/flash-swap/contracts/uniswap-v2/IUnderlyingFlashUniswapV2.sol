// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

import "./IUniswapV2Pair.sol";

/// @title IUnderlyingFlashUniswapV2
/// @author Hifi
/// @notice Integration of Uniswap V2 flash swaps for liquidating underwater accounts in Hifi
/// that are collateralized with underlying tokens.
interface IUnderlyingFlashUniswapV2 is IUniswapV2Callee {
    /// EVENTS ///

    event FlashSwapUnderlyingAndLiquidateBorrow(
        address indexed subsidizer,
        address indexed borrower,
        address indexed bond,
        uint256 underlyingAmount,
        uint256 seizeUnderlyingAmount,
        uint256 repayUnderlyingAmount,
        uint256 subsidyUnderlyingAmount,
        uint256 profitUnderlyingAmount
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice The unique BalanceSheet contract associated with this contract.
    function balanceSheet() external view returns (IBalanceSheetV1);

    /// @notice Calculates the amount of underlying that must be repaid to Uniswap. The formula applied is:
    ///
    ///                         underlyingAmount * 1000
    /// repayUnderlyingAmount =  ---------------------
    ///                                   997
    ///
    /// @dev See "getAmountIn" and "getAmountOut" in UniswapV2Library.sol. Flash swaps can be repaid via the
    /// same borrowed pair token but the 0.3% LP fee still applies.
    /// @param underlyingAmount The amount of underlying flash borrowed.
    /// @return repayUnderlyingAmount The minimum amount of underlying that must be repaid.
    function getRepayUnderlyingAmount(uint256 underlyingAmount) external view returns (uint256 repayUnderlyingAmount);

    /// @notice The address of the UniswapV2Factory contract.
    function uniV2Factory() external view returns (address);

    /// @notice The init code hash of the UniswapV2Pair contract.
    function uniV2PairInitCodeHash() external view returns (bytes32);
}
