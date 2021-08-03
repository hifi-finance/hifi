/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/amm/contracts/IHifiPool.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./IHifiProxyTarget.sol";
import "./external/WethInterface.sol";

/// @notice Emitted when the slippage for adding liquidity is higher than what the user is willing to tolerate.
error HifiProxyTarget__AddLiquiditySlippageTooHigh(uint256 expectedHTokenRequired, uint256 actualHTokenRequired);

/// @notice Emitted when the slippage for a trade is higher than what the user is willing to tolerate.
error HifiProxyTarget__TradeSlippageTooHigh(uint256 expectedAmount, uint256 actualAmount);

/// @title HifiProxyTarget
/// @author Hifi
contract HifiProxyTarget is IHifiProxyTarget {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IHifiProxyTarget
    address public constant override WETH_ADDRESS = 0xDf032Bc4B9dC2782Bb09352007D4C57B75160B15;

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiProxyTarget
    function addLiquidity(
        IHifiPool hifiPool,
        uint256 underlyingOffered,
        uint256 maxHTokenRequired
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintParams(underlyingOffered);
        if (hTokenRequired > maxHTokenRequired) {
            revert HifiProxyTarget__AddLiquiditySlippageTooHigh(maxHTokenRequired, hTokenRequired);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingOffered);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingOffered);

        // Transfer the hTokens to the DSProxy.
        IHToken hToken = hifiPool.hToken();
        hToken.transferFrom(msg.sender, address(this), hTokenRequired);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), hTokenRequired);

        // Add liquidity to the AMM.
        uint256 poolTokensMinted = hifiPool.mint(underlyingOffered);

        // The LP tokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowHToken(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 borrowAmount
    ) public override {
        balanceSheet.borrow(hToken, borrowAmount);

        // The hTokens are now in the DSProxy, so we relay them to the end user.
        hToken.transfer(msg.sender, borrowAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowHTokenAndAddLiquidity(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintParams(underlyingOffered);
        if (hTokenRequired > maxBorrowAmount) {
            revert HifiProxyTarget__AddLiquiditySlippageTooHigh(maxBorrowAmount, hTokenRequired);
        }

        // Borrow hToken.
        IHToken hToken = hifiPool.hToken();
        balanceSheet.borrow(hToken, hTokenRequired);

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingOffered);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingOffered);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), hTokenRequired);

        // Add liquidity to pool.
        uint256 poolTokensMinted = hifiPool.mint(underlyingOffered);

        // The LP tokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowHTokenAndBuyUnderlying(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOut
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingOut);
        if (hTokenIn > maxBorrowAmount) {
            revert HifiProxyTarget__TradeSlippageTooHigh(maxBorrowAmount, hTokenIn);
        }

        // Borrow the hTokens.
        IHToken hToken = hifiPool.hToken();
        balanceSheet.borrow(hToken, hTokenIn);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), hTokenIn);

        // Buy underlying and relay it to the end user.
        hifiPool.buyUnderlying(msg.sender, underlyingOut);

        emit BorrowHTokenAndBuyUnderlying(msg.sender, hTokenIn, underlyingOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) public override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 underlyingOut = hifiPool.getQuoteForSellingHToken(borrowAmount);
        if (underlyingOut < minUnderlyingOut) {
            revert HifiProxyTarget__TradeSlippageTooHigh(minUnderlyingOut, underlyingOut);
        }

        // Borrow the hTokens.
        IHToken hToken = hifiPool.hToken();
        balanceSheet.borrow(hToken, borrowAmount);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), borrowAmount);

        // Sell the hTokens and relay the underlying to the end user.
        hifiPool.sellHToken(msg.sender, borrowAmount);

        emit BorrowHTokenAndSellHToken(msg.sender, borrowAmount, underlyingOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHToken(
        IHifiPool hifiPool,
        uint256 hTokenOut,
        uint256 maxUnderlyingIn
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenOut);
        if (underlyingIn > maxUnderlyingIn) {
            revert HifiProxyTarget__TradeSlippageTooHigh(maxUnderlyingIn, underlyingIn);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingIn);

        // Buy the hTokens and relay them to the end user.
        hifiPool.buyHToken(msg.sender, hTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHTokenAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 maxUnderlyingIn,
        uint256 underlyingOffered
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintParams(underlyingOffered);
        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenRequired);
        if (underlyingIn > maxUnderlyingIn) {
            revert HifiProxyTarget__TradeSlippageTooHigh(maxUnderlyingIn, underlyingIn);
        }

        // Transfer the underlying to the DSProxy. We transfer the sum of `underlyingIn` and `underlyingOffered` to
        // avoid making two Erc20 transfers.
        IErc20 underlying = hifiPool.underlying();
        uint256 totalUnderlyingAmount = underlyingIn + underlyingOffered;
        underlying.safeTransferFrom(msg.sender, address(this), totalUnderlyingAmount);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), totalUnderlyingAmount);

        // Buy the hTokens.
        hifiPool.buyHToken(address(this), hTokenRequired);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hifiPool.hToken(), address(hifiPool), hTokenRequired);

        // Add liquidity to the AMM.
        uint256 poolTokensMinted = hifiPool.mint(underlyingOffered);

        // The LP tokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHTokenAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenOut);
        if (underlyingIn > maxUnderlyingIn) {
            revert HifiProxyTarget__TradeSlippageTooHigh(maxUnderlyingIn, underlyingIn);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingIn);

        // Buy the hTokens.
        hifiPool.buyHToken(address(this), hTokenOut);

        // Use the recently bought hTokens to repay the borrow.
        balanceSheet.repayBorrow(hifiPool.hToken(), hTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyUnderlying(
        IHifiPool hifiPool,
        uint256 underlyingOut,
        uint256 maxHTokenIn
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingOut);
        if (hTokenIn > maxHTokenIn) {
            revert HifiProxyTarget__TradeSlippageTooHigh(maxHTokenIn, hTokenIn);
        }

        // Transfer the hTokens to the DSProxy.
        IErc20 hToken = hifiPool.hToken();
        hToken.transferFrom(msg.sender, address(this), hTokenIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(hToken, address(hifiPool), hTokenIn);

        // Buy the underlying and relay it to the end user.
        hifiPool.buyUnderlying(msg.sender, underlyingOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyUnderlyingAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 maxHTokenAmount,
        uint256 underlyingOffered
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingOffered);
        if (hTokenIn > maxHTokenAmount) {
            revert HifiProxyTarget__TradeSlippageTooHigh(maxHTokenAmount, hTokenIn);
        }

        // Transfer the hTokens to the DSProxy.
        IHToken hToken = hifiPool.hToken();
        hToken.transferFrom(msg.sender, address(this), hTokenIn);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), maxHTokenAmount);

        // Buy the underlying.
        hifiPool.buyUnderlying(address(this), underlyingOffered);

        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintParams(underlyingOffered);
        uint256 totalhTokenAmount = hTokenIn + hTokenRequired;
        if (totalhTokenAmount > maxHTokenAmount) {
            revert HifiProxyTarget__AddLiquiditySlippageTooHigh(maxHTokenAmount, totalhTokenAmount);
        }

        // Transfer the hTokens to the DSProxy. We couldn't have known what value `hTokenRequired` will have had
        // after the call to `buyUnderlying`.
        hToken.transferFrom(msg.sender, address(this), hTokenRequired);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(hifiPool.underlying(), address(hifiPool), underlyingOffered);

        // Add liquidity to the AMM.
        uint256 poolTokensMinted = hifiPool.mint(underlyingOffered);

        // The LP tokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateral(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 collateralAmount
    ) public override {
        // Transfer the collateral to the DSProxy.
        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, collateral, collateralAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateralAndBorrowHToken(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external override {
        depositCollateral(balanceSheet, collateral, collateralAmount);
        borrowHToken(balanceSheet, hToken, borrowAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateralAndBorrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external override {
        depositCollateral(balanceSheet, collateral, collateralAmount);
        borrowHTokenAndSellHToken(balanceSheet, hifiPool, borrowAmount, minUnderlyingOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function redeemHToken(IHToken hToken, uint256 hTokenAmount) external override {
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenAmount);

        // Redeem the hTokens.
        IErc20 underlying = hToken.underlying();
        uint256 preUnderlyingBalance = underlying.balanceOf(address(this));
        hToken.redeem(hTokenAmount);

        unchecked {
            // Calculate how much underlying was redeemed.
            uint256 postUnderlyigBalance = underlying.balanceOf(address(this));
            uint256 underlyingAmount = postUnderlyigBalance - preUnderlyingBalance;

            // The underlying is now in the DSProxy, so we relay it to the end user.
            underlying.safeTransfer(msg.sender, underlyingAmount);
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidity(IHifiPool hifiPool, uint256 poolTokensBurned) external override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // The underlying and the hTokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.underlying().safeTransfer(msg.sender, underlyingReturned);
        hifiPool.hToken().transfer(msg.sender, hTokenReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndSellHToken(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 minUnderlyingOut
    ) external override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // The underlying is now in the DSProxy, so we relay it to the end user.
        hifiPool.underlying().safeTransfer(msg.sender, underlyingReturned);

        // Ensure that we are within the user's slippage tolerance.
        uint256 underlyingOut = hifiPool.getQuoteForSellingUnderlying(hTokenReturned);
        if (underlyingOut < minUnderlyingOut) {
            revert HifiProxyTarget__TradeSlippageTooHigh(minUnderlyingOut, underlyingOut);
        }

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hifiPool.hToken(), address(hifiPool), hTokenReturned);

        // Sell the hTokens and relay the underlying to the end user.
        hifiPool.sellHToken(msg.sender, hTokenReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndSellUnderlyingAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        uint256 poolTokensBurned,
        uint256 minHTokenOut
    ) external override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenOut = hifiPool.getQuoteForSellingUnderlying(underlyingReturned);
        if (hTokenOut < minHTokenOut) {
            revert HifiProxyTarget__TradeSlippageTooHigh(minHTokenOut, hTokenOut);
        }

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(hifiPool.underlying(), address(hifiPool), underlyingReturned);

        // Sell the underlying.
        hifiPool.sellUnderlying(address(this), underlyingReturned);

        // Query the amount of debt that the user owes.
        IHToken hToken = hifiPool.hToken();
        uint256 debtAmount = balanceSheet.getDebtAmount(address(this), hToken);

        // Sum up the returned hTokens and the recently bought hTokens.
        uint256 repayAmount = hTokenReturned + hTokenOut;

        // Repay the borrow.
        if (debtAmount >= repayAmount) {
            balanceSheet.repayBorrow(hToken, repayAmount);
        } else {
            balanceSheet.repayBorrow(hToken, debtAmount);
            unchecked {
                // Relay any remainding hTokens to the end user.
                uint256 hTokenDelta = repayAmount - debtAmount;
                if (hTokenDelta > 0) {
                    hToken.transfer(msg.sender, hTokenDelta);
                }
            }
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function repayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 repayAmount
    ) external override {
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), repayAmount);

        // Repay the borrow.
        balanceSheet.repayBorrow(hToken, repayAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellHToken(
        IHifiPool hifiPool,
        uint256 hTokenIn,
        uint256 minUnderlyingOut
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 underlyingOut = hifiPool.getQuoteForSellingHToken(hTokenIn);
        if (underlyingOut < minUnderlyingOut) {
            revert HifiProxyTarget__TradeSlippageTooHigh(minUnderlyingOut, underlyingOut);
        }

        // Transfer the hTokens to the DSProxy.
        IHToken hToken = hifiPool.hToken();
        hToken.transferFrom(msg.sender, address(this), hTokenIn);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), hTokenIn);

        // Sell the hTokens and relay the underlying to the end user.
        hifiPool.sellHToken(msg.sender, hTokenIn);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlying(
        IHifiPool hifiPool,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenOut = hifiPool.getQuoteForSellingUnderlying(underlyingIn);
        if (hTokenOut < minHTokenOut) {
            revert HifiProxyTarget__TradeSlippageTooHigh(minHTokenOut, hTokenOut);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.transferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingIn);

        // Sell the underlying and relay the hTokens to the end user.
        hifiPool.sellUnderlying(msg.sender, underlyingIn);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlyingAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenOut = hifiPool.getQuoteForSellingUnderlying(underlyingIn);
        if (hTokenOut < minHTokenOut) {
            revert HifiProxyTarget__TradeSlippageTooHigh(minHTokenOut, hTokenOut);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.transferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingIn);

        // Sell the underlying.
        hifiPool.sellUnderlying(address(this), underlyingIn);

        // Query the amount of debt that the user owes.
        IHToken hToken = hifiPool.hToken();
        uint256 debtAmount = balanceSheet.getDebtAmount(address(this), hToken);

        // Repay the borrow.
        if (debtAmount >= hTokenOut) {
            balanceSheet.repayBorrow(hToken, hTokenOut);
        } else {
            balanceSheet.repayBorrow(hToken, debtAmount);
            unchecked {
                // Relay any remainding hTokens to the end user.
                uint256 hTokenDelta = hTokenOut - debtAmount;
                if (hTokenDelta > 0) {
                    hToken.transfer(msg.sender, hTokenDelta);
                }
            }
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function supplyUnderlying(IHToken hToken, uint256 underlyingAmount) external override {
        uint256 preHTokenBalance = hToken.balanceOf(address(this));
        supplyUnderlyingInternal(hToken, underlyingAmount);

        unchecked {
            // Calculate how many hTokens were minted.
            uint256 postHTokenBalance = hToken.balanceOf(address(this));
            uint256 hTokenAmount = postHTokenBalance - preHTokenBalance;

            // The hTokens are now in the DSProxy, so we relay them to the end user.
            hToken.transfer(msg.sender, hTokenAmount);
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function supplyUnderlyingAndRepayBorrow(
        IHToken hToken,
        IBalanceSheetV1 balanceSheet,
        uint256 underlyingAmount
    ) external override {
        uint256 preHTokenBalance = hToken.balanceOf(address(this));
        supplyUnderlyingInternal(hToken, underlyingAmount);

        unchecked {
            // Calculate how many hTokens were minted.
            uint256 postHTokenBalance = hToken.balanceOf(address(this));
            uint256 hTokenAmount = postHTokenBalance - preHTokenBalance;

            // Use the newly minted hTokens to repay the debt.
            balanceSheet.repayBorrow(hToken, hTokenAmount);
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function withdrawCollateral(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 withdrawAmount
    ) external override {
        balanceSheet.withdrawCollateral(collateral, withdrawAmount);

        // The collateral is now in the DSProxy, so we relay it to the end user.
        collateral.safeTransfer(msg.sender, withdrawAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositCollateral(IBalanceSheetV1 balanceSheet) public payable override {
        uint256 collateralAmount = msg.value;

        // Convert the received ETH to WETH.
        WethInterface(WETH_ADDRESS).deposit{ value: collateralAmount }();

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, IErc20(WETH_ADDRESS), collateralAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositAndBorrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external payable override {
        wrapEthAndDepositCollateral(balanceSheet);
        borrowHTokenAndSellHToken(balanceSheet, hifiPool, borrowAmount, minUnderlyingOut);
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///

    /// @dev See the documentation for the public functions that call this internal function.
    function approveSpender(
        IErc20 token,
        address spender,
        uint256 amount
    ) internal {
        uint256 allowance = token.allowance(address(this), spender);
        if (allowance < amount) {
            token.approve(spender, type(uint256).max);
        }
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function depositCollateralInternal(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 collateralAmount
    ) internal {
        // Allow the BalanceSheet contract to spend collateral from the DSProxy.
        approveSpender(collateral, address(balanceSheet), collateralAmount);

        // Deposit the collateral into the BalanceSheet contract.
        balanceSheet.depositCollateral(collateral, collateralAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function supplyUnderlyingInternal(IHToken hToken, uint256 underlyingAmount) internal {
        //IRedemptionPool redemptionPool = hToken.redemptionPool();
        IErc20 underlying = hToken.underlying();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HToken contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hToken), underlyingAmount);

        // Supply the underlying and mint hTokens.
        hToken.supplyUnderlying(underlyingAmount);
    }
}
