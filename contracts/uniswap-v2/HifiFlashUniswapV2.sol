// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/balanceSheet/SBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

import "./IHifiFlashUniswapV2.sol";
import "./UniswapV2PairLike.sol";

/// @notice Emitted when the caller is not the Uniswap V2 pair contract.
error HifiFlashUniswapV2__CallNotAuthorized(address caller);

/// @notice Emitted when the flash borrowed asset is the collateral instead of the underlying.
error HifiFlashUniswapV2__FlashBorrowCollateral();

/// @notice Emitted when the liquidation does not yield a sufficient profit.
error HifiFlashUniswapV2__InsufficientProfit(uint256 seizedCollateralAmount, uint256 repayAmount, uint256 minProfit);

/// @title HifiFlashUniswapV2
/// @author Hifi
contract HifiFlashUniswapV2 is IHifiFlashUniswapV2 {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IHifiFlashUniswapV2
    IBalanceSheetV1 public override balanceSheet;

    /// @inheritdoc IHifiFlashUniswapV2
    mapping(address => UniswapV2PairLike) public override pairs;

    /// @inheritdoc IHifiFlashUniswapV2
    IErc20 public override usdc;

    /// CONSTRUCTOR ///
    constructor(
        IBalanceSheetV1 balanceSheet_,
        IErc20 usdc_,
        address[] memory pairs_
    ) {
        balanceSheet = IBalanceSheetV1(balanceSheet_);
        for (uint256 i = 0; i < pairs_.length; i++) {
            pairs[pairs_[i]] = UniswapV2PairLike(pairs_[i]);
        }
        usdc = usdc_;
    }

    /// PUBLIC CONSTANT FUNCTIONS ////

    /// @dev Calculate the amount of WBTC that has to be repaid to Uniswap. The formula applied is:
    ///
    ///              (collateralReserves * usdcAmount) * 1000
    /// repayment = ------------------------------------
    ///               (usdcReserves - usdcAmount) * 997
    ///
    /// See "getAmountIn" and "getAmountOut" in UniswapV2Library.sol. Flash swaps that are repaid via the
    /// corresponding pair token is akin to a normal swap, so the 0.3% LP fee applies.
    function getRepayAmount(UniswapV2PairLike pair, uint256 usdcAmount) public view returns (uint256) {
        (uint112 collateralReserves, uint112 usdcReserves, ) = pair.getReserves();

        // Note that we don't need a fixed-point math library here because the UniswapV2Pair.sol contract performs
        // sanity checks on "wbtcAmount" and "usdcAmount" before calling the current contract.
        uint256 numerator = collateralReserves * usdcAmount * 1000;
        uint256 denominator = (usdcReserves - usdcAmount) * 997;
        uint256 repayAmount = numerator / denominator + 1;

        return repayAmount;
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @dev Called by the UniswapV2Pair contract.
    function uniswapV2Call(
        address sender,
        uint256 collateralAmount,
        uint256 usdcAmount,
        bytes calldata data
    ) external override {
        UniswapV2PairLike pair = pairs[msg.sender];
        if (msg.sender != address(pair)) {
            revert HifiFlashUniswapV2__CallNotAuthorized(msg.sender);
        }
        if (collateralAmount > 0) {
            revert HifiFlashUniswapV2__FlashBorrowCollateral();
        }

        // Unpack the ABI encoded data passed by the UniswapV2Pair contract.
        (address borrower, IHToken bond, IErc20 collateral, uint256 minProfit) = abi.decode(
            data,
            (address, IHToken, IErc20, uint256)
        );

        // Mint hUSDC and liquidate the borrower.
        uint256 mintedHUsdcAmount = mintHUsdc(bond, usdcAmount);
        uint256 seizedCollateralAmount = liquidateBorrow(borrower, bond, mintedHUsdcAmount, collateral);

        // Calculate the amount of WBTC required.
        uint256 repayAmount = getRepayAmount(pair, usdcAmount);
        if (seizedCollateralAmount <= repayAmount + minProfit) {
            revert HifiFlashUniswapV2__InsufficientProfit(seizedCollateralAmount, repayAmount, minProfit);
        }

        // Pay back the loan.
        collateral.safeTransfer(address(pair), repayAmount);

        // Reap the profit.
        uint256 profit = seizedCollateralAmount - repayAmount;
        collateral.safeTransfer(sender, profit);

        emit FlashLiquidate(
            sender,
            borrower,
            address(bond),
            usdcAmount,
            mintedHUsdcAmount,
            seizedCollateralAmount,
            profit
        );
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///

    /// @dev Supplies the USDC to the HToken contract to mint hUSDC without taking on debt.
    function mintHUsdc(IHToken bond, uint256 usdcAmount) internal returns (uint256 mintedHUsdcAmount) {
        // Allow the HToken contract to spend USDC if allowance not enough.
        uint256 allowance = usdc.allowance(address(this), address(bond));
        if (allowance < usdcAmount) {
            usdc.approve(address(bond), type(uint256).max);
        }

        uint256 oldHTokenBalance = bond.balanceOf(address(this));
        bond.supplyUnderlying(usdcAmount);
        uint256 newHTokenBalance = bond.balanceOf(address(this));
        unchecked {
            mintedHUsdcAmount = newHTokenBalance - oldHTokenBalance;
        }
    }

    /// @dev Liquidates the borrower by transferring the USDC to the BalanceSheet. By doing this, the liquidator
    /// receives collateral at a discount.
    function liquidateBorrow(
        address borrower,
        IHToken bond,
        uint256 repayAmount,
        IErc20 collateral
    ) internal returns (uint256 seizedCollateralAmount) {
        uint256 oldCollateralBalance = collateral.balanceOf(address(this));
        balanceSheet.liquidateBorrow(borrower, bond, repayAmount, collateral);
        uint256 newCollateralBalance = collateral.balanceOf(address(this));
        unchecked {
            seizedCollateralAmount = newCollateralBalance - oldCollateralBalance;
        }
    }
}
