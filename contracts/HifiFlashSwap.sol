// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./HifiFlashSwapStorage.sol";
import "./interfaces/BalanceSheetLike.sol";
import "./interfaces/FintrollerLike.sol";
import "./interfaces/FyTokenLike.sol";
import "./interfaces/RedemptionPoolLike.sol";
import "./interfaces/UniswapV2CaleeLike.sol";
import "./interfaces/UniswapV2PairLike.sol";

/// @title HifiFlashSwap
/// @author Hifi
contract HifiFlashSwap is
    HifiFlashSwapStorage, // no dependency
    UniswapV2CaleeLike, // no dependency
    Admin // two depdendencies
{
    constructor(
        address fintroller_,
        address balanceSheet_,
        address pair_
    ) Admin() {
        fintroller = FintrollerLike(fintroller_);
        balanceSheet = BalanceSheetLike(balanceSheet_);
        pair = UniswapV2PairLike(pair_);
        token0 = Erc20Interface(pair.token0());
        token1 = Erc20Interface(pair.token1());
    }

    event FlashLiquidate(
        address indexed liquidator,
        address indexed borrower,
        address indexed fyToken,
        uint256 mintedFyTokenAmount,
        uint256 clutchedCollateralAmount,
        uint256 profit
    );

    /// @dev "amount0" is WBTC and "amount1" is USDC for the WBTC-USDC pool.
    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override {
        require(msg.sender == address(pair), "ERR_CALLER_NOT_UNISWAP_V2_PAIR");
        require(amount0 == 0, "ERR_TOKEN0_AMOUNT_ZERO");

        // Unpack the ABI encoded data passed by the Uniswap V2 Pair contract.
        (address fyTokenAddress, address borrower, uint256 minProfit) = abi.decode(data, (address, address, uint256));
        FyTokenLike fyToken = FyTokenLike(fyTokenAddress);

        uint256 mintedFyTokenAmount = mintFyTokens(fyToken, amount1);
        uint256 clutchedCollateralAmount = liquidateBorrow(fyToken, borrower, mintedFyTokenAmount);

        // Paid in the corresponding token pair, i.e. the collateral asset for Hifi.
        uint256 token0RepaymentAmount = 0;
        {
            // -> Calculate the amount of WBTC required
            //
            //          wbtcReserves * usdcAmount * 1000
            // wbtc = -----------------------------------
            //          (usdcReserves - usdcAmount) * 997
            (uint112 usdcReserves, uint112 wbtcReserves, ) = pair.getReserves();
            uint256 numerator = wbtcReserves * amount1 * 1000;
            uint256 denominator = (usdcReserves - amount1) * 997;
            token0RepaymentAmount = numerator / denominator + 1;
        }
        require(clutchedCollateralAmount > token0RepaymentAmount + minProfit, "ERR_INSUFFICIENT_PROFIT");

        // Pay back the loan.
        require(token1.transfer(address(pair), token0RepaymentAmount), "ERR_CALL_TOKEN1_TRANSFER");

        // Reap the profit.
        uint256 profit = clutchedCollateralAmount - token0RepaymentAmount;
        token1.transfer(sender, profit);

        emit FlashLiquidate(sender, borrower, fyTokenAddress, mintedFyTokenAmount, clutchedCollateralAmount, profit);
    }

    /// @dev Supply the underlying to the RedemptionPool and mint fyTokens.
    function mintFyTokens(FyTokenLike fyToken, uint256 amount1) internal returns (uint256) {
        address redemptionPoolAddress = fyToken.redemptionPool();

        // Allow the RedemptionPool to spend token0 if allowance not enough.
        uint256 allowance = token0.allowance(address(this), redemptionPoolAddress);
        if (allowance < amount1) {
            token0.approve(redemptionPoolAddress, type(uint256).max);
        }

        uint256 preFyTokenBalance = fyToken.balanceOf(address(this));
        RedemptionPoolLike(redemptionPoolAddress).supplyUnderlying(amount1);
        uint256 postFyTokenBalance = fyToken.balanceOf(address(this));
        uint256 mintedFyTokenAmount = postFyTokenBalance - preFyTokenBalance;
        return mintedFyTokenAmount;
    }

    /// @dev Transfer the received token0 to the BalanceSheet and receive collateral at a discount.
    function liquidateBorrow(
        FyTokenLike fyToken,
        address borrower,
        uint256 mintedFyTokenAmount
    ) internal returns (uint256) {
        uint256 preToken1Balance = token1.balanceOf(address(this));
        fyToken.liquidateBorrow(borrower, mintedFyTokenAmount);
        uint256 postToken1Balance = token1.balanceOf(address(this));
        uint256 clutchedCollateralAmount = postToken1Balance - preToken1Balance;
        return clutchedCollateralAmount;
    }
}
