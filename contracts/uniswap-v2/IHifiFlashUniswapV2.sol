// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";

import "./UniswapV2CalleeLike.sol";
import "./UniswapV2PairLike.sol";

/// @title IHifiFlashUniswapV2
/// @author Hifi
/// @notice Integration of Uniswap V2 flash swaps for liquidating underwater accounts in Hifi.
interface IHifiFlashUniswapV2 is UniswapV2CalleeLike {
    /// EVENTS ///

    event FlashLiquidate(
        address indexed liquidator,
        address indexed borrower,
        address indexed hToken,
        uint256 flashBorrowedUsdcAmount,
        uint256 mintedHUsdcAmount,
        uint256 seizedWbtcAmount,
        uint256 collateralProfit
    );

    /// CONSTANT FUNCTIONS ///

    /// @notice The unique BalanceSheet contract associated with this contract.
    function balanceSheet() external view returns (IBalanceSheetV1);

    /// @notice Mapping between the raw address of the pair contract and the interfaced pair contract.
    function pairs(address pair) external view returns (UniswapV2PairLike);

    /// @notice The address of the USDC contract.
    function usdc() external view returns (IErc20);
}
