/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./IHifiProxyTarget.sol";
import "./external/weth/WethInterface.sol";

// import "../external/balancer/ExchangeProxyInterface.sol";
// import "../external/balancer/TokenInterface.sol";

/// @title HifiProxyTarget
/// @author Hifi
/// @notice Target contract with scripts for the Regents release of the protocol.
/// @dev Meant to be used with a DSProxy contract via delegatecall.
contract HifiProxyTarget is IHifiProxyTarget {
    using SafeErc20 for IErc20;

    /// PUBLIC STORAGE ///

    /// @inheritdoc IHifiProxyTarget
    address public constant override WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

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
        uint256 underlyingAmount
    ) external override {
        IHToken hToken = hifiPool.hToken();
        IErc20 underlying = hifiPool.underlying();
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
        uint256 poolTokensMinted = hifiPool.mint(underlyingAmount);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowHTokensAndBuyUnderlying(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 underlyingAmount
    ) public payable override {
        // Get required hToken amount for buying exact underlying amount
        uint256 borrowAmount = hifiPool.getQuoteForBuyingUnderlying(underlyingAmount);

        // Borrow the hTokens.
        balanceSheet.borrow(hToken, borrowAmount);

        // Allow the HiFiPool contract to spend hTokens if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < borrowAmount) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // Finally, bought the exact underlying and send it to the end user.
        hifiPool.buyUnderlying(msg.sender, underlyingAmount);

        emit BorrowHTokensAndBuyUnderlying(msg.sender, borrowAmount, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function borrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 borrowAmount
    ) public payable override {
        // Borrow the hTokens.
        balanceSheet.borrow(hToken, borrowAmount);

        // Allow the HiFiPool contract to spend hTokens if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < borrowAmount) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // Finally, bought the max underlying for exact borrowed amount of hToken and send it to the end user.
        uint256 underlyingAmount = hifiPool.sellHToken(msg.sender, borrowAmount);

        emit BorrowAndSellHTokens(msg.sender, borrowAmount, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function burn(IHifiPool hifiPool, uint256 poolTokens) public override {
        IErc20 underlying = hifiPool.underlying();
        IHToken hToken = hifiPool.hToken();

        // Transfer the liquidity tokens to the DSProxy.
        hifiPool.transferFrom(msg.sender, address(this), poolTokens);

        // Allow the HiFiPool contract to spend iquidity tokens if allowance not enough.
        uint256 allowance = hifiPool.allowance(address(this), address(hifiPool));
        if (allowance < poolTokens) {
            hifiPool.approve(address(hifiPool), type(uint256).max);
        }

        uint256 underlyingReturned;
        uint256 hTokenReturned;
        (underlyingReturned, hTokenReturned) = hifiPool.burn(poolTokens);

        // The underlying and htoken is now in the DSProxy, so we relay it to the end user.
        underlying.safeTransfer(msg.sender, underlyingReturned);
        hToken.transfer(msg.sender, hTokenReturned);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHToken(IHifiPool hifiPool, uint256 hTokenAmount) public override {
        IHToken hToken = hifiPool.hToken();
        buyHTokenInternal(hifiPool, hTokenAmount);
        // The htoken is now in the DSProxy, so we relay it to the end user.
        hToken.transfer(msg.sender, hTokenAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHTokenAndPool(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount
    ) public override {
        IErc20 underlying = hifiPool.underlying();

        // underlying token amount required to buy hToken
        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenAmount);

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingIn) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Buys hToken with underlying, hToken is now in DSProxy.
        hifiPool.buyHToken(address(this), hTokenAmount);

        // Amount of underlying token offered to provide liquidity.
        uint256 underlyingOffered = underlyingAmount - underlyingIn;

        // add liquidity to pool
        uint256 poolTokensMinted = hifiPool.mint(underlyingOffered);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyHtokenAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 repayAmount
    ) external override {
        IHToken hToken = hifiPool.hToken();
        buyHTokenInternal(hifiPool, repayAmount);

        // Use the recently bought hTokens to repay the borrow.
        balanceSheet.repayBorrow(hToken, repayAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyUnderlying(IHifiPool hifiPool, uint256 underlyingAmount) public override {
        IErc20 hToken = hifiPool.hToken();

        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingAmount);

        // Transfer the hToken to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenIn);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < hTokenIn) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // Buys hToken with underlying, and sent it to user.
        hifiPool.buyUnderlying(msg.sender, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function buyUnderlyingAndPool(
        IHifiPool hifiPool,
        uint256 hTokenAmount,
        uint256 underlyingAmount
    ) public override {
        IErc20 hToken = hifiPool.hToken();

        // Transfer the hToken to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenAmount);

        uint256 hTokenIn = hifiPool.getQuoteForBuyingUnderlying(underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = hToken.allowance(address(this), address(hifiPool));
        if (allowance < hTokenIn) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // Buys hToken with underlying.
        hifiPool.buyUnderlying(address(this), underlyingAmount);

        // add liquidity to pool.
        // This contract should have required hToken to provide liquidity after buying underlyingAmount underlying.
        uint256 poolTokensMinted = hifiPool.mint(underlyingAmount);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
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
        uint256 borrowAmount
    ) external payable override {
        depositCollateral(balanceSheet, collateral, collateralAmount);
        borrowAndSellHTokens(balanceSheet, hToken, hifiPool, borrowAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function mint(
        IHifiPool hifiPool,
        uint256 underlyingAmount,
        uint256 hTokenRequired
    ) public override {
        IErc20 underlying = hifiPool.underlying();
        IHToken hToken = hifiPool.hToken();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmount) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }
        // Transfer the hTokens to the DSProxy.
        hToken.transferFrom(msg.sender, address(this), hTokenRequired);

        // Allow the HiFiPool contract to spend hToken if allowance not enough.
        uint256 hTokenAllowance = hToken.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < hTokenRequired) {
            hToken.approve(address(hifiPool), type(uint256).max);
        }

        // add liquidity to pool
        uint256 poolTokensMinted = hifiPool.mint(underlyingAmount);

        // The liquidity tokens are now in the DSProxy, so we relay it to the end user.
        hifiPool.transfer(msg.sender, poolTokensMinted);
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
    function sellHToken(IHifiPool hifiPool, uint256 hTokenAmount) public override {
        IHToken hToken = hifiPool.hToken();
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
    function sellUnderlying(IHifiPool hifiPool, uint256 underlyingAmount) public override {
        IErc20 underlying = hifiPool.underlying();
        // Transfer the underlying to the DSProxy.
        underlying.transferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 hTokenAllowance = underlying.allowance(address(this), address(hifiPool));
        if (hTokenAllowance < underlyingAmount) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }
        hifiPool.sellUnderlying(msg.sender, underlyingAmount);
    }

    /// @inheritdoc IHifiProxyTarget
    function sellUnderlyingAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 underlyingAmount
    ) external override {
        IErc20 underlying = hToken.underlying();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingAmount) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Sell underlyingAmount of underlying token for max hToken.
        uint256 hTokenOut = hifiPool.sellUnderlying(address(this), underlyingAmount);

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
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 borrowAmount
    ) external payable override {
        wrapEthAndDepositCollateral(balanceSheet, hToken);

        borrowAndSellHTokens(balanceSheet, hToken, hifiPool, borrowAmount);
    }

    /// INTERNAL NON-CONSTANT FUNCTIONS ///
    /// @dev See the documentation for the public functions that call this internal function.
    function buyHTokenInternal(IHifiPool hifiPool, uint256 hTokenAmount) internal {
        IErc20 underlying = hifiPool.underlying();

        uint256 underlyingIn = hifiPool.getQuoteForBuyingHToken(hTokenAmount);

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingIn);

        // Allow the HiFiPool contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(hifiPool));
        if (allowance < underlyingIn) {
            underlying.approve(address(hifiPool), type(uint256).max);
        }

        // Buys hToken with underlying, hToken is now in DSProxy.
        hifiPool.buyHToken(address(this), hTokenAmount);
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
}
