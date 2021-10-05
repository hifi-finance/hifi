/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/amm/contracts/IHifiPool.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./IHifiProxyTarget.sol";
import "./external/WethInterface.sol";

/// @notice Emitted when the hToken slippage is higher than what the user is willing to tolerate.
error HifiProxyTarget__AddLiquidityHTokenSlippage(uint256 expectedHTokenRequired, uint256 actualHTokenRequired);

/// @notice Emitted when the underlying slippage is higher than what the user is willing to tolerate.
error HifiProxyTarget__AddLiquidityUnderlyingSlippage(
    uint256 expectedUnderlyingRequired,
    uint256 actualUnderlyingRequired
);

/// @notice Emitted when the slippage is higher than what the user is willing to tolerate.
error HifiProxyTarget__TradeSlippage(uint256 expectedAmount, uint256 actualAmount);

/// @title HifiProxyTarget
/// @author Hifi
contract HifiProxyTarget is IHifiProxyTarget {
    using SafeErc20 for IErc20;

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiProxyTarget
    function addLiquidity(
        IHifiPool hifiPool,
        uint256 underlyingOffered,
        uint256 maxHTokenRequired
    ) external override {
        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintInputs(underlyingOffered);
        if (hTokenRequired > maxHTokenRequired) {
            revert HifiProxyTarget__AddLiquidityHTokenSlippage(maxHTokenRequired, hTokenRequired);
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
    ) public override {
        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintInputs(underlyingOffered);
        if (hTokenRequired > maxBorrowAmount) {
            revert HifiProxyTarget__AddLiquidityHTokenSlippage(maxBorrowAmount, hTokenRequired);
        }

        // Borrow the hTokens.
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
            revert HifiProxyTarget__TradeSlippage(maxBorrowAmount, hTokenIn);
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
            revert HifiProxyTarget__TradeSlippage(minUnderlyingOut, underlyingOut);
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
            revert HifiProxyTarget__TradeSlippage(maxUnderlyingIn, underlyingIn);
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
        uint256 hTokenOut,
        uint256 maxUnderlyingAmount
    ) external override {
        IErc20 underlying = hifiPool.underlying();

        // Transfer the underlying to the DSProxy.
        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenOut);
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        IHToken hToken = hifiPool.hToken();
        approveSpender(hToken, address(hifiPool), hTokenOut);

        // Buy the hTokens.
        hifiPool.buyHToken(address(this), hTokenOut);

        // Ensure that we are within the user's slippage tolerance.
        uint256 normalizedUnderlyingReserves = normalize(
            underlying.balanceOf(address(hifiPool)),
            hifiPool.underlyingPrecisionScalar()
        );
        uint256 hTokenReserves = hToken.balanceOf(address(hifiPool));
        uint256 underlyingRequired = (normalizedUnderlyingReserves * hTokenOut) / hTokenReserves;
        uint256 totalUnderlyingAmount = underlyingIn + underlyingRequired;
        if (totalUnderlyingAmount > maxUnderlyingAmount) {
            revert HifiProxyTarget__AddLiquidityUnderlyingSlippage(maxUnderlyingAmount, totalUnderlyingAmount);
        }

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingRequired);

        // Add liquidity to the AMM.
        uint256 poolTokensMinted = hifiPool.mint(underlyingRequired);

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
            revert HifiProxyTarget__TradeSlippage(maxUnderlyingIn, underlyingIn);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingIn);

        // Buy the hTokens.
        hifiPool.buyHToken(address(this), hTokenOut);

        // Query the amount of debt that the user owes.
        IHToken hToken = hifiPool.hToken();
        uint256 debtAmount = balanceSheet.getDebtAmount(address(this), hToken);

        // Use the recently bought hTokens to repay the borrow.
        if (debtAmount >= hTokenOut) {
            balanceSheet.repayBorrow(hToken, hTokenOut);
        } else {
            balanceSheet.repayBorrow(hToken, debtAmount);

            // Relay any remaining hTokens to the end user.
            unchecked {
                uint256 hTokenDelta = hTokenOut - debtAmount;
                if (hTokenDelta > 0) {
                    hToken.transfer(msg.sender, hTokenDelta);
                }
            }
        }
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
            revert HifiProxyTarget__TradeSlippage(maxHTokenIn, hTokenIn);
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
            revert HifiProxyTarget__TradeSlippage(maxHTokenAmount, hTokenIn);
        }

        // Transfer the hTokens to the DSProxy.
        IHToken hToken = hifiPool.hToken();
        hToken.transferFrom(msg.sender, address(this), hTokenIn);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), maxHTokenAmount);

        // Buy the underlying.
        hifiPool.buyUnderlying(address(this), underlyingOffered);

        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintInputs(underlyingOffered);
        uint256 totalhTokenAmount = hTokenIn + hTokenRequired;
        if (totalhTokenAmount > maxHTokenAmount) {
            revert HifiProxyTarget__AddLiquidityHTokenSlippage(maxHTokenAmount, totalhTokenAmount);
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
        uint256 depositAmount
    ) public override {
        // Transfer the collateral to the DSProxy.
        collateral.safeTransferFrom(msg.sender, address(this), depositAmount);

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, collateral, depositAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateralAndBorrowHToken(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        uint256 depositAmount,
        uint256 borrowAmount
    ) external override {
        depositCollateral(balanceSheet, collateral, depositAmount);
        borrowHToken(balanceSheet, hToken, borrowAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateralAndBorrowHTokenAndAddLiquidity(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
    ) external override {
        depositCollateral(balanceSheet, collateral, depositAmount);
        borrowHTokenAndAddLiquidity(balanceSheet, hifiPool, maxBorrowAmount, underlyingOffered);
    }

    function depositUnderlyingAsCollateralAndBorrowHTokenAndAddLiquidity(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered
    ) external override {
        // When the underlying moonlights as the collateral, the user can borrow on a one-to-one basis.
        uint256 maxBorrowAmount = normalize(depositAmount, hifiPool.underlyingPrecisionScalar());

        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintInputs(underlyingOffered);
        if (hTokenRequired > maxBorrowAmount) {
            revert HifiProxyTarget__AddLiquidityHTokenSlippage(maxBorrowAmount, hTokenRequired);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        uint256 totalUnderlyingAmount = depositAmount + underlyingOffered;
        underlying.safeTransferFrom(msg.sender, address(this), totalUnderlyingAmount);

        // Deposit the underlying as collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, underlying, depositAmount);

        // Borrow the hTokens.
        IHToken hToken = hifiPool.hToken();
        balanceSheet.borrow(hToken, hTokenRequired);

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
    function depositCollateralAndBorrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external override {
        depositCollateral(balanceSheet, collateral, depositAmount);
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
            uint256 postUnderlyingBalance = underlying.balanceOf(address(this));
            uint256 underlyingAmount = postUnderlyingBalance - preUnderlyingBalance;

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
    function removeLiquidityAndRedeemHToken(IHifiPool hifiPool, uint256 poolTokensBurned) external override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // Redeem the hTokens.
        IHToken hToken = hifiPool.hToken();
        IErc20 underlying = hToken.underlying();
        uint256 preUnderlyingBalance = underlying.balanceOf(address(this));
        hToken.redeem(hTokenReturned);

        // Calculate how much underlying was redeemed.
        uint256 underlyingAmount;
        unchecked {
            uint256 postUnderlyingBalance = underlying.balanceOf(address(this));
            underlyingAmount = postUnderlyingBalance - preUnderlyingBalance;
        }

        // Relay all the underlying it to the end user.
        uint256 totalUnderlyingAmount = underlyingReturned + underlyingAmount;
        underlying.safeTransfer(msg.sender, totalUnderlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndRepayBorrowAndWithdrawCollateral(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 poolTokensBurned,
        uint256 repayAmount,
        uint256 withdrawAmount
    ) external override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // Repay the borrow.
        IHToken hToken = hifiPool.hToken();
        balanceSheet.repayBorrow(hToken, repayAmount);

        // Relay any remaining hTokens to the end user.
        if (hTokenReturned > repayAmount) {
            unchecked {
                uint256 hTokenDelta = hTokenReturned - repayAmount;
                if (hTokenDelta > 0) {
                    hToken.transfer(msg.sender, hTokenDelta);
                }
            }
        }

        // Withdraw the collateral and relay the underlying to the end user.
        IErc20 underlying = hifiPool.underlying();
        if (collateral == underlying) {
            balanceSheet.withdrawCollateral(collateral, withdrawAmount);
            uint256 totalUnderlyingAmount = underlyingReturned + withdrawAmount;
            underlying.safeTransfer(msg.sender, totalUnderlyingAmount);
        } else {
            withdrawCollateral(balanceSheet, collateral, withdrawAmount);
            underlying.safeTransfer(msg.sender, underlyingReturned);
        }
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
        uint256 underlyingOut = hifiPool.getQuoteForSellingHToken(hTokenReturned);
        if (underlyingOut < minUnderlyingOut) {
            revert HifiProxyTarget__TradeSlippage(minUnderlyingOut, underlyingOut);
        }

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hifiPool.hToken(), address(hifiPool), hTokenReturned);

        // Sell the hTokens and relay the underlying to the end user.
        hifiPool.sellHToken(msg.sender, hTokenReturned);
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
            revert HifiProxyTarget__TradeSlippage(minUnderlyingOut, underlyingOut);
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
            revert HifiProxyTarget__TradeSlippage(minHTokenOut, hTokenOut);
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
            revert HifiProxyTarget__TradeSlippage(minHTokenOut, hTokenOut);
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

            // Relay any remaining hTokens to the end user.
            unchecked {
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
    ) public override {
        balanceSheet.withdrawCollateral(collateral, withdrawAmount);

        // The collateral is now in the DSProxy, so we relay it to the end user.
        collateral.safeTransfer(msg.sender, withdrawAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositCollateral(WethInterface weth, IBalanceSheetV1 balanceSheet) public payable override {
        uint256 depositAmount = msg.value;

        // Convert the received ETH to WETH.
        weth.deposit{ value: depositAmount }();

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, IErc20(address(weth)), depositAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositAndBorrowHTokenAndSellHToken(
        WethInterface weth,
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external payable override {
        wrapEthAndDepositCollateral(weth, balanceSheet);
        borrowHTokenAndSellHToken(balanceSheet, hifiPool, borrowAmount, minUnderlyingOut);
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

    /// @notice Upscales the amount to normalized form, i.e. 18 decimals of precision.
    /// @param amount The amount to normalize.
    /// @param precisionScalar The ratio between normalized precision and the desired precision.
    /// @param normalizedAmount The amount with 18 decimals of precision.
    function normalize(uint256 amount, uint256 precisionScalar) internal pure returns (uint256 normalizedAmount) {
        normalizedAmount = precisionScalar != 1 ? amount * precisionScalar : amount;
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
        uint256 depositAmount
    ) internal {
        // Allow the BalanceSheet contract to spend collateral from the DSProxy.
        approveSpender(collateral, address(balanceSheet), depositAmount);

        // Deposit the collateral into the BalanceSheet contract.
        balanceSheet.depositCollateral(collateral, depositAmount);
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
