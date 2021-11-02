// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";

import "./IUniswapV2Pair.sol";

/// @title IHifiFlashUniswapV2Underlying
/// @author Hifi
/// @notice Integration of Uniswap V2 flash swaps for liquidating underwater accounts in Hifi
/// that are collateralized with underlying tokens.
interface IHifiFlashUniswapV2Underlying is IUniswapV2Callee {
    /// EVENTS ///

    event FlashLiquidateBorrow(
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

    /// @notice Compares the token addresses to find the collateral address and the underlying amount.
    /// @dev See this StackExchange post: https://ethereum.stackexchange.com/q/102670/24693.
    ///
    /// Requirements:
    ///
    /// - The amount of non-underlying flash borrowed must be zero.
    /// - The underlying must be one of the pair's tokens.
    ///
    /// @param pair The Uniswap V2 pair contract.
    /// @param amount0 The amount of token0.
    /// @param amount1 The amount of token1.
    /// @param underlying The address of the underlying contract.
    /// @return collateral The collateral contract.
    /// @return underlyingAmount The amount of underlying flash borrowed.
    function getCollateralAndUnderlyingAmount(
        IUniswapV2Pair pair,
        uint256 amount0,
        uint256 amount1,
        IErc20 underlying
    ) external view returns (IErc20 collateral, uint256 underlyingAmount);

    /// @notice Calculates the amount that must be repaid to Uniswap. The formula applied is:
    ///
    ///                         underlyingAmount * 1000
    /// collateralRepayAmount =  ---------------------
    ///                                   997
    ///
    /// @dev See "getAmountIn" and "getAmountOut" in UniswapV2Library.sol. Flash swaps that are repaid via the
    /// corresponding pair token is akin to a normal swap, so the 0.3% LP fee applies.
    /// @param underlyingAmount The amount of underlying flash borrowed.
    /// @return collateralRepayAmount The minimum amount of collateral that must be repaid.
    function getRepayCollateralAmount(uint256 underlyingAmount) external view returns (uint256 collateralRepayAmount);

    /// @notice The address of the UniswapV2Factory contract.
    function uniV2Factory() external view returns (address);

    /// @notice The init code hash of the UniswapV2Pair contract.
    function uniV2PairInitCodeHash() external view returns (bytes32);
}
