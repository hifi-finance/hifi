// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";

import "./PoolAddress.sol";

/// @title IFlashUniswapV3
/// @author Hifi
/// @notice Integration of Uniswap V3 flash swaps for liquidating underwater accounts in Hifi.
interface IFlashUniswapV3 is IUniswapV3SwapCallback {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the caller is not the Uniswap V3 pool contract.
    error FlashUniswapV3__CallNotAuthorized(address caller);

    /// @notice Emitted when liquidating a vault backed by underlying.
    error FlashUniswapV3__LiquidateUnderlyingBackedVault(address borrower, address underlying);

    /// @notice Emitted when the liquidation either does not yield a sufficient profit or it costs more
    /// than what the subsidizer is willing to pay.
    error FlashUniswapV3__TurnoutNotSatisfied(uint256 seizeAmount, uint256 repayAmount, int256 turnout);

    /// EVENTS ///

    /// @notice Emitted when a flash swap is made and an account is liquidated.
    /// @param liquidator The address of the liquidator account.
    /// @param borrower The address of the borrower account being liquidated.
    /// @param bond The address of the hToken contract.
    /// @param collateral The address of the collateral contract.
    /// @param underlyingAmount The amount of underlying flash borrowed.
    /// @param seizeAmount The amount of collateral seized.
    /// @param repayAmount The amount of collateral that had to be repaid by the liquidator.
    /// @param subsidyAmount The amount of collateral subsidized by the liquidator.
    /// @param profitAmount The amount of collateral pocketed as profit by the liquidator.
    event FlashSwapAndLiquidateBorrow(
        address indexed liquidator,
        address indexed borrower,
        address indexed bond,
        address collateral,
        uint256 underlyingAmount,
        uint256 seizeAmount,
        uint256 repayAmount,
        uint256 subsidyAmount,
        uint256 profitAmount
    );

    /// STRUCTS ///

    struct FlashLiquidateParams {
        address borrower;
        IHToken bond;
        IErc20 collateral;
        uint24 poolFee;
        int256 turnout;
        uint256 underlyingAmount;
    }

    /// CONSTANT FUNCTIONS ///

    /// @notice The `BalanceSheet` contract.
    function balanceSheet() external view returns (IBalanceSheetV2);

    /// @notice The address of the UniswapV3Factory contract.
    function uniV3Factory() external view returns (address);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Flash borrows underlying from Uniswap V3, liquidates the underwater account, and repays the flash loan.
    /// @param params The parameters for the liquidation.
    function flashLiquidate(FlashLiquidateParams memory params) external;
}
