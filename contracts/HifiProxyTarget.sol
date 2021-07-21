/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

import "./IHifiProxyTarget.sol";
import "./external/weth/WethInterface.sol";

/// @notice Emitted when the slippage is more that expected slippage tolerance.
error HifiProxyTarget__ExceedExpectedSlippageTolerance(uint256 slippage);

/// @title HifiProxyTarget
/// @author Hifi
/// @notice Target contract with scripts for the Regents release of the protocol.
/// @dev Meant to be used with a DSProxy contract via delegatecall.
contract HifiProxyTarget is IHifiProxyTarget {
    using SafeErc20 for IErc20;
    using PRBMathUD60x18 for uint256;
    /// PUBLIC STORAGE ///

    /// @inheritdoc IHifiProxyTarget
    address public constant override WETH_ADDRESS = 0xDf032Bc4B9dC2782Bb09352007D4C57B75160B15;

    /// CONSTANT FUNCTIONS ///
    function gethTokenRequiredForMint(IHifiPool hifiPool, uint256 underlyingAmount)
        public
        view
        override
        returns (uint256 hTokenAmount)
    {
        IHToken hToken = hifiPool.hToken();
        // Calculate the amount of hToken required.
        // We need to use the actual reserves rather than the virtual reserves here.
        uint256 hTokenReserves = hToken.balanceOf(address(hifiPool));
        uint256 normalizedUnderlyingOffered = normalize(hifiPool, underlyingAmount);
        uint256 supply = hifiPool.totalSupply();
        uint256 poolTokensMint = (supply * normalizedUnderlyingOffered) / hifiPool.getNormalizedUnderlyingReserves();
        hTokenAmount = (hTokenReserves * poolTokensMint) / supply;
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiProxyTarget
    function borrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 borrowAmount
    ) public override {
        balanceSheet.borrow(hToken, borrowAmount);
        hToken.transfer(msg.sender, borrowAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowAndPool(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) external override {
        IHToken hToken = hifiPool.hToken();
        IErc20 underlying = hifiPool.underlying();

        // Calculate the amount of hToken required.
        uint256 hTokenAmount = gethTokenRequiredForMint(hifiPool, underlyingAmount);

        if (hTokenAmount > borrowAmount) {
            uint256 slippage = ((hTokenAmount - borrowAmount).div(hTokenAmount)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // borrow hToken.
        balanceSheet.borrow(hToken, borrowAmount);

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmount) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < borrowAmount) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // add liquidity to pool
        uint256 poolTokens = hifiPool.mint(underlyingAmount);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokens);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowHTokensAndBuyUnderlying(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) public payable override {
        // Get required hToken amount for buying exact underlying amount
        uint256 borrowAmountIn = hifiPool.getQuoteForBuyingUnderlying(underlyingAmount);

        if (borrowAmountIn > borrowAmount) {
            uint256 slippage = ((borrowAmountIn - borrowAmount).div(borrowAmountIn)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Borrow the hTokens.
        balanceSheet.borrow(hToken, borrowAmountIn);

        // Allow the HiFiPool contract to spend hTokens if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < borrowAmountIn) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // Finally, bought the exact underlying and send it to the end user.
        hifiPool.buyUnderlying(msg.sender, underlyingAmount);

        emit BorrowHTokensAndBuyUnderlying(msg.sender, borrowAmountIn, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) public payable override {
        // Borrow the exact hTokens.
        balanceSheet.borrow(hToken, borrowAmount);

        // Allow the HiFiPool contract to spend hTokens if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < borrowAmount) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // Get quote for selling HTokens
        uint256 underlyingAmountOut = hifiPool.getQuoteForSellingHToken(borrowAmount);

        if (underlyingAmountOut < underlyingAmount) {
            uint256 slippage = ((underlyingAmount - underlyingAmountOut).div(underlyingAmount)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Finally, bought the max underlying for exact borrowed amount of hToken and send it to the end user.
        hifiPool.sellHToken(msg.sender, borrowAmount);

        emit BorrowAndSellHTokens(msg.sender, borrowAmount, underlyingAmountOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function burn(IHifiPool hifiPool, uint256 poolTokens) public override {
        IErc20 underlying = hifiPool.underlying();
        IHToken hToken = hifiPool.hToken();
        uint256 underlyingReturned;
        uint256 hTokenReturned;
        (underlyingReturned, hTokenReturned) = burnInternal(hifiPool, poolTokens);

        // The underlying and htoken is now in the DSProxy, so we relay it to the end user.
        underlying.safeTransfer(msg.sender, underlyingReturned);
        hToken.transfer(msg.sender, hTokenReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function burnAndSellHTokens(IHifiPool hifiPool, uint256 poolTokens) public override {
        IErc20 underlying = hifiPool.underlying();
        IHToken hToken = hifiPool.hToken();

        uint256 underlyingReturned;
        uint256 hTokenReturned;

        (underlyingReturned, hTokenReturned) = burnInternal(hifiPool, poolTokens);

        // The underlying and htoken is now in the DSProxy, so we relay underlying to the end user.
        underlying.safeTransfer(msg.sender, underlyingReturned);

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < hTokenReturned) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }
        // Sell hTokens for underlying and return it to user.
        hifiPool.sellHToken(msg.sender, hTokenReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function burnAndSellUnderlyingAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 poolTokens
    ) public override {
        IErc20 underlying = hifiPool.underlying();
        IHToken hToken = hifiPool.hToken();

        uint256 underlyingReturned;
        uint256 hTokenReturned;

        (underlyingReturned, hTokenReturned) = burnInternal(hifiPool, poolTokens);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 hTokenAllowance = underlying.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < underlyingReturned) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }
        uint256 hTokenOut;
        hTokenOut = hifiPool.sellUnderlying(address(this), underlyingReturned);

        uint256 totalHtokensToRepay = hTokenOut + hTokenReturned;
        // Use the recently bought hTokens to repay the borrow.
        balanceSheet.repayBorrow(hToken, totalHtokensToRepay);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHToken(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) public override {
        IHToken hToken = hifiPool.hToken();

        buyHTokenInternal(hifiPool, hTokenAmount, underlyingAmount, slippageTolerance);
        // The htoken is now in the DSProxy, so we relay it to the end user.
        hToken.transfer(msg.sender, hTokenAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHTokenAndPool(
        IHifiPool hifiPool,
        uint256 underlyingAmountToInvest,
        uint256 slippageTolerance
    ) public override {
        IErc20 underlying = hifiPool.underlying();
        IErc20 hToken = hifiPool.hToken();

        // Calculate the amount of hToken required.
        uint256 hTokenAmountRequired = gethTokenRequiredForMint(hifiPool, underlyingAmountToInvest);
        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenAmountRequired);

        buyHTokenInternal(hifiPool, hTokenAmountRequired, underlyingIn, slippageTolerance);

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmountToInvest);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmountToInvest) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < hTokenAmountRequired) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // add liquidity to pool
        uint256 poolTokens = hifiPool.mint(underlyingAmountToInvest);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokens);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHtokenAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) external override {
        IHToken hToken = hifiPool.hToken();
        buyHTokenInternal(hifiPool, hTokenAmount, underlyingAmount, slippageTolerance);

        // Use the recently bought hTokens to repay the borrow.
        balanceSheet.repayBorrow(hToken, hTokenAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyUnderlying(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) public override {
        IErc20 underlying = hifiPool.underlying();
        uint256 underlyingReturned = buyUnderlyingInternal(hifiPool, hTokenAmount, underlyingAmount, slippageTolerance);
        underlying.safeTransfer(msg.sender, underlyingReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyUnderlyingAndPool(
        IHifiPool hifiPool,
        uint256 underlyingAmountToInvest,
        uint256 slippageTolerance
    ) public override {
        IErc20 hToken = hifiPool.hToken();
        IErc20 underlying = hifiPool.underlying();

        // Get amount of hTokens required to buy underlying amount to invest.
        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingAmountToInvest);

        buyUnderlyingInternal(hifiPool, hTokenIn, underlyingAmountToInvest, slippageTolerance);

        // Get amount of hTokens to required to invest.
        uint256 hTokenToInvest = gethTokenRequiredForMint(hifiPool, underlyingAmountToInvest);
        // Transfer the hToken to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenToInvest);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmountToInvest) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < hTokenToInvest) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }
        // add liquidity to pool.
        // This contract should have required hToken to provide liquidity after buying underlyingAmount underlying.
        uint256 poolTokens = hifiPool.mint(underlyingAmountToInvest);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokens);
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
    function depositAndBorrow(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) public payable override {
        depositCollateral(balanceSheet, collateral, collateralAmount);
        borrow(balanceSheet, hToken, borrowAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function depositAndBorrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) external payable override {
        depositCollateral(balanceSheet, collateral, collateralAmount);
        borrowAndSellHTokens(balanceSheet, hToken, hifiPool, borrowAmount, underlyingAmount, slippageTolerance);
    }

    /// @inheritdoc IHifiProxyTarget
    function mint(
        IHifiPool hifiPool,
        uint256 underlyingAmount,
        uint256 hTokenRequired,
        uint256 slippageTolerance
    ) public override {
        IErc20 underlying = hifiPool.underlying();
        IHToken hToken = hifiPool.hToken();

        // Calculate the amount of hToken required.
        uint256 hTokenAmount = gethTokenRequiredForMint(hifiPool, underlyingAmount);

        if (hTokenAmount > hTokenRequired) {
            uint256 slippage = ((hTokenAmount - hTokenRequired).div(hTokenAmount)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmount) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenAmount);

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < hTokenAmount) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // add liquidity to pool
        uint256 poolTokens = hifiPool.mint(underlyingAmount);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokens);
    }

    /// @inheritdoc IHifiProxyTarget
    function redeem(IHToken hToken, uint256 hTokenAmount) public override {
        IErc20 underlying = hToken.underlying();

        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenAmount);

        // Redeem the hTokens.
        uint256 preUnderlyingBalance = underlying.balanceOf(address(this));
        hToken.redeem(hTokenAmount);

        // Calculate how many underlying have been redeemed.
        uint256 postUnderlyigBalance = underlying.balanceOf(address(this));
        uint256 underlyingAmount = postUnderlyigBalance - preUnderlyingBalance;

        // The underlying is now in the DSProxy, so we relay it to the end user.
        underlying.safeTransfer(msg.sender, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function repayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 repayAmount
    ) public override {
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), repayAmount);

        // Repay the borrow.
        balanceSheet.repayBorrow(hToken, repayAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellHToken(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) public override {
        IHToken hToken = hifiPool.hToken();

        uint256 underlyingAmountOut = hifiPool.getQuoteForSellingHToken(hTokenAmount);
        if (underlyingAmountOut < underlyingAmount) {
            uint256 slippage = ((underlyingAmount - underlyingAmountOut).div(underlyingAmount)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenAmount);

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < hTokenAmount) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }
        hifiPool.sellHToken(msg.sender, hTokenAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlying(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) public override {
        IHToken hToken = hifiPool.hToken();
        uint256 hTokenOut = sellUnderlyingInternal(hifiPool, hTokenAmount, underlyingAmount, slippageTolerance);
        hToken.transfer(msg.sender, hTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlyingAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) external override {
        IHToken hToken = hifiPool.hToken();

        uint256 hTokenOut = sellUnderlyingInternal(hifiPool, hTokenAmount, underlyingAmount, slippageTolerance);

        // Use the recently bought hTokens to repay the borrow.
        balanceSheet.repayBorrow(hToken, hTokenOut);
    }

    /// @inheritdoc IHifiProxyTarget
    function supplyUnderlying(IHToken hToken, uint256 underlyingAmount) public override {
        uint256 preHTokenBalance = hToken.balanceOf(address(this));
        supplyUnderlyingInternal(hToken, underlyingAmount);

        //Calculate how many hTokens have been minted.
        uint256 postHTokenBalance = hToken.balanceOf(address(this));
        uint256 hTokenAmount = postHTokenBalance - preHTokenBalance;

        // The hTokens are now in the DSProxy, so we relay them to the end user.
        hToken.transfer(msg.sender, hTokenAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function supplyUnderlyingAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 underlyingAmount
    ) external override {
        uint256 preHTokenBalance = hToken.balanceOf(address(this));
        supplyUnderlyingInternal(hToken, underlyingAmount);

        // Calculate how many hTokens have been minted.
        uint256 postHTokenBalance = hToken.balanceOf(address(this));
        uint256 hTokenAmount = postHTokenBalance - preHTokenBalance;

        // Use the newly minted hTokens to repay the debt.
        balanceSheet.repayBorrow(hToken, hTokenAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function withdrawCollateral(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 withdrawAmount
    ) public override {
        ///IErc20 collateral, uint256 withdrawAmount
        balanceSheet.withdrawCollateral(collateral, withdrawAmount);

        // The collateral is now in the DSProxy, so we relay it to the end user.
        collateral.safeTransfer(msg.sender, withdrawAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositCollateral(IBalanceSheetV1 balanceSheet, IHToken hToken) public payable override {
        uint256 collateralAmount = msg.value;

        // Convert the received ETH to WETH.
        WethInterface(WETH_ADDRESS).deposit{ value: collateralAmount }();

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, hToken, collateralAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function wrapEthAndDepositAndBorrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) external payable override {
        IHToken hToken = hifiPool.hToken();

        wrapEthAndDepositCollateral(balanceSheet, hToken);
        borrowAndSellHTokens(balanceSheet, hToken, hifiPool, borrowAmount, underlyingAmount, slippageTolerance);
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///

    function burnInternal(IHifiPool hifiPool, uint256 poolTokens)
        internal
        returns (uint256 underlyingReturned, uint256 hTokenReturned)
    {
        // Transfer the liquidity tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokens);

        // Allow the HiFiPool contract to spend iquidity tokens if allowance not enough.
        uint256 allowance = hifiPool.allowance(address(this), address(hifiPool));
        if (allowance < poolTokens) {
            hifiPool.approve(address(hifiPool), type(uint256).max);
        }

        // Burn pool tokens
        (underlyingReturned, hTokenReturned) = hifiPool.burn(poolTokens);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function buyHTokenInternal(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) internal {
        IErc20 underlying = hifiPool.underlying();

        uint256 underlyingAmountIn = hifiPool.getQuoteForBuyingHToken(hTokenAmount);

        if (underlyingAmountIn > underlyingAmount) {
            uint256 slippage = ((underlyingAmountIn - underlyingAmount).div(underlyingAmountIn)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmountIn);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmountIn) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Buys hToken with underlying, hToken is now in DSProxy.
        hifiPool.buyHToken(address(this), hTokenAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.

    function buyUnderlyingInternal(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) internal returns (uint256 underlyingReturned) {
        IErc20 hToken = hifiPool.hToken();
        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingAmount);
        if (hTokenIn > hTokenAmount) {
            uint256 slippage = ((hTokenIn - hTokenAmount).div(hTokenIn)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Transfer the hToken to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenIn);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < hTokenIn) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }
        // Buys hToken with underlying
        underlyingReturned = hifiPool.buyUnderlying(address(this), underlyingAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function depositCollateralInternal(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 collateralAmount
    ) internal {
        // Allow the BalanceSheet contract to spend tokens if allowance not enough.
        uint256 allowance = collateral.allowance(address(this), address(balanceSheet));
        if (allowance < collateralAmount) {
            collateral.approve(address(balanceSheet), type(uint256).max);
        }

        // Deposit the collateral into the BalanceSheet contract.
        balanceSheet.depositCollateral(collateral, collateralAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    /// @notice Upscales the underlying amount to normalized form, i.e. 18 decimals of precision.
    /// @param underlyingAmount The underlying amount with its actual decimals of precision.
    /// @param normalizedUnderlyingAmount The underlying amount with 18 decimals of precision.
    function normalize(IHifiPool hifiPool, uint256 underlyingAmount)
        internal
        view
        returns (uint256 normalizedUnderlyingAmount)
    {
        normalizedUnderlyingAmount = hifiPool.underlyingPrecisionScalar() != 1
            ? underlyingAmount * hifiPool.underlyingPrecisionScalar()
            : underlyingAmount;
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function supplyUnderlyingInternal(IHToken hToken, uint256 underlyingAmount) internal {
        //IRedemptionPool redemptionPool = hToken.redemptionPool();
        IErc20 underlying = hToken.underlying();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the RedemptionPool contract to spend tokens if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hToken));
        if (allowance < underlyingAmount) {
            underlying.approve(address(hToken), type(uint256).max);
        }

        // Supply the underlying and mint hTokens.
        hToken.supplyUnderlying(underlyingAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.

    function sellUnderlyingInternal(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 slippageTolerance
    ) internal returns (uint256 hTokenOut) {
        IErc20 underlying = hifiPool.underlying();

        uint256 hTokenAmountOut = hifiPool.getQuoteForSellingUnderlying(underlyingAmount);
        if (hTokenAmountOut < hTokenAmount) {
            uint256 slippage = ((hTokenAmount - hTokenAmountOut).div(hTokenAmount)).mul(100 * 1e18);
            if (slippage > slippageTolerance) {
                revert HifiProxyTarget__ExceedExpectedSlippageTolerance(slippage);
            }
        }
        // Transfer the underlying to the DSProxy.
        underlying.transferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 hTokenAllowance = underlying.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < underlyingAmount) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }
        hTokenOut = hifiPool.sellUnderlying(address(this), underlyingAmount);
    }
}
