/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@hifi/amm/contracts/IHifiPool.sol";
import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@hifi/protocol/contracts/core/h-token/IHToken.sol";
import "@prb/contracts/token/erc20/IErc20.sol";
import "@prb/contracts/token/erc20/SafeErc20.sol";
import "@prb/contracts/token/erc20/IErc20Permit.sol";

import "./IHifiProxyTarget.sol";
import "./external/WethInterface.sol";

/// @title HifiProxyTarget
/// @author Hifi
contract HifiProxyTarget is IHifiProxyTarget {
    using SafeErc20 for IErc20;

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiProxyTarget
    function borrowHTokenAndBuyUnderlying(
        IBalanceSheetV2 balanceSheet,
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
        IBalanceSheetV2 balanceSheet,
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
    function buyHTokenAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut
    ) public override {
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
                hToken.transfer(msg.sender, hTokenDelta);
            }
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHTokenAndRepayBorrowWithSignature(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external override {
        permitInternal(IErc20Permit(address(hifiPool.underlying())), maxUnderlyingIn, deadline, signatureUnderlying);
        buyHTokenAndRepayBorrow(hifiPool, balanceSheet, maxUnderlyingIn, hTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateral(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        uint256 depositAmount
    ) public override {
        // Transfer the collateral to the DSProxy.
        collateral.safeTransferFrom(msg.sender, address(this), depositAmount);

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, collateral, depositAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositCollateralWithSignature(
        IBalanceSheetV2 balanceSheet,
        IErc20Permit collateral,
        uint256 depositAmount,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external override {
        permitInternal(collateral, depositAmount, deadline, signatureCollateral);
        depositCollateral(balanceSheet, collateral, depositAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositUnderlyingAndMintHTokenAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered
    ) public override {
        // Calculate how many hTokens will be minted.
        uint256 hTokenMinted = normalize(depositAmount, hifiPool.underlyingPrecisionScalar());

        // Ensure that we are within the user's slippage tolerance.
        (uint256 hTokenRequired, ) = hifiPool.getMintInputs(underlyingOffered);
        if (hTokenRequired > hTokenMinted) {
            revert HifiProxyTarget__AddLiquidityHTokenSlippage(hTokenMinted, hTokenRequired);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        uint256 totalUnderlyingAmount = depositAmount + underlyingOffered;
        underlying.safeTransferFrom(msg.sender, address(this), totalUnderlyingAmount);

        // Deposit the underlying in the HToken contract to mint hTokens.
        IHToken hToken = hifiPool.hToken();

        // Allow the HToken contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hToken), depositAmount);

        // Deposit the underlying in the HToken contract to mint hTokens.
        hToken.depositUnderlying(depositAmount);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingOffered);

        // Allow the HifiPool contract to spend hTokens from the DSProxy.
        approveSpender(hToken, address(hifiPool), hTokenRequired);

        // Add liquidity to pool.
        uint256 poolTokensMinted = hifiPool.mint(underlyingOffered);

        // The LP tokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);

        // Relay any remaining hTokens to the end user.
        if (hTokenMinted > hTokenRequired) {
            unchecked {
                uint256 hTokenDelta = hTokenMinted - hTokenRequired;
                hToken.transfer(msg.sender, hTokenDelta);
            }
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function depositUnderlyingAndMintHTokenAndAddLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external override {
        uint256 totalUnderlyingAmount = depositAmount + underlyingOffered;
        permitInternal(
            IErc20Permit(address(hifiPool.underlying())),
            totalUnderlyingAmount,
            deadline,
            signatureUnderlying
        );

        depositUnderlyingAndMintHTokenAndAddLiquidity(hifiPool, depositAmount, underlyingOffered);
    }

    /// @inheritdoc IHifiProxyTarget
    function redeem(
        IHToken hToken,
        uint256 hTokenAmount,
        uint256 underlyingAmount
    ) public override {
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenAmount);

        // Redeem the underlying.
        IErc20 underlying = hToken.underlying();
        hToken.redeem(underlyingAmount);

        // The underlying is now in the DSProxy, so we relay it to the end user.
        underlying.safeTransfer(msg.sender, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function redeemWithSignature(
        IHToken hToken,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 deadline,
        bytes memory signatureHToken
    ) external override {
        permitInternal(hToken, hTokenAmount, deadline, signatureHToken);
        redeem(hToken, hTokenAmount, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidity(IHifiPool hifiPool, uint256 poolTokensBurned) public override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // The underlying and the hTokens are now in the DSProxy, so we relay them to the end user.
        hifiPool.underlying().safeTransfer(msg.sender, underlyingReturned);
        hifiPool.hToken().transfer(msg.sender, hTokenReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndRedeem(IHifiPool hifiPool, uint256 poolTokensBurned) public override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // Calculate how much underlying will be redeemed.
        uint256 underlyingRedeemed = denormalize(hTokenReturned, hifiPool.underlyingPrecisionScalar());

        // Normalize the underlying amount to 18 decimals.
        uint256 hTokenAmount = normalize(underlyingRedeemed, hifiPool.underlyingPrecisionScalar());

        // Redeem the underlying.
        IHToken hToken = hifiPool.hToken();
        hToken.redeem(underlyingRedeemed);

        // Relay all the underlying it to the end user.
        uint256 totalUnderlyingAmount = underlyingReturned + underlyingRedeemed;
        hToken.underlying().safeTransfer(msg.sender, totalUnderlyingAmount);

        // Relay any remaining hTokens to the end user.
        if (hTokenReturned > hTokenAmount) {
            unchecked {
                uint256 hTokenDelta = hTokenReturned - hTokenAmount;
                hToken.transfer(msg.sender, hTokenDelta);
            }
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndRedeemWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external override {
        permitInternal(hifiPool, poolTokensBurned, deadline, signatureLPToken);
        removeLiquidityAndRedeem(hifiPool, poolTokensBurned);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndWithdrawUnderlying(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 withdrawAmount
    ) public override {
        // Transfer the LP tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokensBurned);

        // Burn the LP tokens.
        (uint256 underlyingReturned, uint256 hTokenReturned) = hifiPool.burn(poolTokensBurned);

        // Normalize the underlying amount to 18 decimals.
        uint256 hTokenAmount = normalize(withdrawAmount, hifiPool.underlyingPrecisionScalar());

        // Withdraw underlying in exchange for hTokens.
        IHToken hToken = hifiPool.hToken();
        hToken.withdrawUnderlying(withdrawAmount);

        // Relay any remaining hTokens to the end user.
        if (hTokenReturned > hTokenAmount) {
            unchecked {
                uint256 hTokenDelta = hTokenReturned - hTokenAmount;
                hToken.transfer(msg.sender, hTokenDelta);
            }
        }

        // Relay all the underlying it to the end user.
        uint256 totalUnderlyingAmount = underlyingReturned + withdrawAmount;
        hToken.underlying().safeTransfer(msg.sender, totalUnderlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityAndWithdrawUnderlyingWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 withdrawAmount,
        uint256 deadline,
        bytes memory signatureLPToken
    ) public override {
        permitInternal(hifiPool, poolTokensBurned, deadline, signatureLPToken);
        removeLiquidityAndWithdrawUnderlying(hifiPool, poolTokensBurned, withdrawAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function removeLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external override {
        permitInternal(hifiPool, poolTokensBurned, deadline, signatureLPToken);
        removeLiquidity(hifiPool, poolTokensBurned);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellHToken(
        IHifiPool hifiPool,
        uint256 hTokenIn,
        uint256 minUnderlyingOut
    ) public override {
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
    function sellHTokenWithSignature(
        IHifiPool hifiPool,
        uint256 hTokenIn,
        uint256 minUnderlyingOut,
        uint256 deadline,
        bytes memory signatureHToken
    ) external override {
        // Transfer the hTokens to the DSProxy.
        IHToken hToken = hifiPool.hToken();
        permitInternal(hToken, hTokenIn, deadline, signatureHToken);
        sellHToken(hifiPool, hTokenIn, minUnderlyingOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlying(
        IHifiPool hifiPool,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) public override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenOut = hifiPool.getQuoteForSellingUnderlying(underlyingIn);
        if (hTokenOut < minHTokenOut) {
            revert HifiProxyTarget__TradeSlippage(minHTokenOut, hTokenOut);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HifiPool contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hifiPool), underlyingIn);

        // Sell the underlying and relay the hTokens to the end user.
        hifiPool.sellUnderlying(msg.sender, underlyingIn);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlyingAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) public override {
        // Ensure that we are within the user's slippage tolerance.
        uint256 hTokenOut = hifiPool.getQuoteForSellingUnderlying(underlyingIn);
        if (hTokenOut < minHTokenOut) {
            revert HifiProxyTarget__TradeSlippage(minHTokenOut, hTokenOut);
        }

        // Transfer the underlying to the DSProxy.
        IErc20 underlying = hifiPool.underlying();
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

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
                hToken.transfer(msg.sender, hTokenDelta);
            }
        }
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlyingAndRepayBorrowWithSignature(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external override {
        permitInternal(IErc20Permit(address(hifiPool.underlying())), underlyingIn, deadline, signatureUnderlying);
        sellUnderlyingAndRepayBorrow(hifiPool, balanceSheet, underlyingIn, minHTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlyingWithSignature(
        IHifiPool hifiPool,
        uint256 underlyingIn,
        uint256 minHTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external override {
        permitInternal(IErc20Permit(address(hifiPool.underlying())), underlyingIn, deadline, signatureUnderlying);
        sellUnderlying(hifiPool, underlyingIn, minHTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function withdrawCollateral(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        uint256 withdrawAmount
    ) external override {
        balanceSheet.withdrawCollateral(collateral, withdrawAmount);

        // The collateral is now in the DSProxy, so we relay it to the end user.
        collateral.safeTransfer(msg.sender, withdrawAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositCollateral(WethInterface weth, IBalanceSheetV2 balanceSheet) public payable override {
        uint256 depositAmount = msg.value;

        // Convert the received ETH to WETH.
        weth.deposit{ value: depositAmount }();

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, IErc20(address(weth)), depositAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function withdrawCollateralAndUnwrapWeth(
        WethInterface weth,
        IBalanceSheetV2 balanceSheet,
        uint256 withdrawAmount
    ) public override {
        balanceSheet.withdrawCollateral(IErc20(address(weth)), withdrawAmount);

        // Convert the received WETH to ETH.
        weth.withdraw(withdrawAmount);

        // The ETH is now in the DSProxy, so we relay it to the end user.
        payable(msg.sender).transfer(withdrawAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositAndBorrowHTokenAndSellHToken(
        WethInterface weth,
        IBalanceSheetV2 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external payable override {
        wrapEthAndDepositCollateral(weth, balanceSheet);
        borrowHTokenAndSellHToken(balanceSheet, hifiPool, borrowAmount, minUnderlyingOut);
    }

    /// INTERNAL CONSTANT FUNCTIONS ///

    /// @notice Downscales from normalized amount, i.e. 18 decimals of precision.
    /// @param amount The amount with 18 decimals of precision.
    /// @param precisionScalar The ratio between normalized precision and the desired precision.
    /// @param denormalizedAmount The amount with fewer decimals of precision.
    function denormalize(uint256 amount, uint256 precisionScalar) internal pure returns (uint256 denormalizedAmount) {
        unchecked {
            denormalizedAmount = precisionScalar != 1 ? amount / precisionScalar : amount;
        }
    }

    /// @notice Upscales to normalized form, i.e. 18 decimals of precision.
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
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        uint256 collateralAmount
    ) internal {
        // Allow the BalanceSheet contract to spend collateral from the DSProxy.
        approveSpender(collateral, address(balanceSheet), collateralAmount);

        // Deposit the collateral into the BalanceSheet contract.
        balanceSheet.depositCollateral(collateral, collateralAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function depositUnderlyingInternal(IHToken hToken, uint256 underlyingAmount) internal {
        IErc20 underlying = hToken.underlying();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HToken contract to spend underlying from the DSProxy.
        approveSpender(underlying, address(hToken), underlyingAmount);

        // Deposit the underlying in the HToken contract to mint hTokens.
        hToken.depositUnderlying(underlyingAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function getUnderlyingRequired(IHifiPool hifiPool, uint256 hTokenOut)
        internal
        view
        returns (uint256 underlyingRequired)
    {
        // Calculate how much underlying is required to provide "hTokenOut" liquidity to the AMM.
        IHToken hToken = hifiPool.hToken();
        uint256 normalizedUnderlyingReserves = hifiPool.getNormalizedUnderlyingReserves();
        uint256 hTokenReserves = hToken.balanceOf(address(hifiPool));
        uint256 normalizedUnderlyingRequired = (normalizedUnderlyingReserves * hTokenOut) / hTokenReserves;
        underlyingRequired = denormalize(normalizedUnderlyingRequired, hifiPool.underlyingPrecisionScalar());
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function permitInternal(
        IErc20Permit token,
        uint256 amount,
        uint256 deadline,
        bytes memory signature
    ) internal {
        if (signature.length > 0) {
            bytes32 r;
            bytes32 s;
            uint8 v;

            // solhint-disable-next-line no-inline-assembly
            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }
            token.permit(msg.sender, address(this), amount, deadline, v, r, s);
        }
    }
}
