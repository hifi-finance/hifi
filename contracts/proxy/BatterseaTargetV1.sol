/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "./IBatterseaTargetV1.sol";
import "../external/balancer/ExchangeProxyInterface.sol";
import "../external/balancer/TokenInterface.sol";
import "../external/weth/WethInterface.sol";

/// @title BatterseaTargetV1
/// @author Hifi
/// @notice Target contract with scripts for the Battersea release of the protocol.
/// @dev Meant to be used with a DSProxy contract via delegatecall.
contract BatterseaTargetV1 is
    IBatterseaTargetV1 /// no dependency
{
    using SafeErc20 for IErc20;
    using SafeErc20 for IFyToken;

    /// STORAGE PROPERTIES ///

    /// @inheritdoc IBatterseaTargetV1
    address public constant override EXCHANGE_PROXY_ADDRESS = 0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21;

    /// @inheritdoc IBatterseaTargetV1
    address public constant override WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IBatterseaTargetV1
    function borrow(IFyToken fyToken, uint256 borrowAmount) public override {
        fyToken.borrow(borrowAmount);
        fyToken.safeTransfer(msg.sender, borrowAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function borrowAndSellFyTokens(
        IFyToken fyToken,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) public payable override {
        IErc20 underlying = fyToken.underlying();

        // Borrow the fyTokens.
        fyToken.borrow(borrowAmount);

        // Allow the Balancer contract to spend fyTokens if allowance not enough.
        uint256 allowance = fyToken.allowance(address(this), EXCHANGE_PROXY_ADDRESS);
        if (allowance < borrowAmount) {
            fyToken.approve(EXCHANGE_PROXY_ADDRESS, type(uint256).max);
        }

        // Prepare the parameters for calling Balancer.
        TokenInterface tokenIn = TokenInterface(address(fyToken));
        TokenInterface tokenOut = TokenInterface(address(underlying));
        uint256 totalAmountOut = underlyingAmount;
        uint256 maxTotalAmountIn = borrowAmount;
        uint256 nPools = 1;

        // Recall that Balancer reverts when the swap is not successful.
        uint256 totalAmountIn =
            ExchangeProxyInterface(EXCHANGE_PROXY_ADDRESS).smartSwapExactOut(
                tokenIn,
                tokenOut,
                totalAmountOut,
                maxTotalAmountIn,
                nPools
            );

        // When we get a better price than the worst that we assumed we would, not all fyTokens are sold.
        uint256 fyTokenDelta = borrowAmount - totalAmountIn;

        // If the fyToken delta is non-zero, we use it to partially repay the borrow.
        // Note: this is not gas-efficient.
        if (fyTokenDelta > 0) {
            fyToken.repayBorrow(fyTokenDelta);
        }

        // Finally, transfer the recently bought underlying to the end user.
        underlying.safeTransfer(msg.sender, underlyingAmount);

        emit BorrowAndSellFyTokens(msg.sender, borrowAmount, fyTokenDelta, underlyingAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function depositCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) public override {
        // Transfer the collateral to the DSProxy.
        fyToken.collateral().safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function depositAndLockCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) public override {
        depositCollateral(balanceSheet, fyToken, collateralAmount);
        balanceSheet.lockCollateral(fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function depositAndLockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) public payable override {
        depositAndLockCollateral(balanceSheet, fyToken, collateralAmount);
        borrow(fyToken, borrowAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function depositAndLockCollateralAndBorrowAndSellFyTokens(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable override {
        depositAndLockCollateral(balanceSheet, fyToken, collateralAmount);
        borrowAndSellFyTokens(fyToken, borrowAmount, underlyingAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function freeCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external override {
        balanceSheet.freeCollateral(fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function freeAndWithdrawCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external override {
        balanceSheet.freeCollateral(fyToken, collateralAmount);
        withdrawCollateral(balanceSheet, fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function lockCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external override {
        balanceSheet.lockCollateral(fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function lockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external override {
        balanceSheet.lockCollateral(fyToken, collateralAmount);
        borrowAndSellFyTokens(fyToken, borrowAmount, underlyingAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function openVault(IBalanceSheet balanceSheet, IFyToken fyToken) external override {
        balanceSheet.openVault(fyToken);
    }

    /// @inheritdoc IBatterseaTargetV1
    function redeemFyTokens(IFyToken fyToken, uint256 fyTokenAmount) public override {
        IErc20 underlying = fyToken.underlying();
        IRedemptionPool redemptionPool = fyToken.redemptionPool();

        // Transfer the fyTokens to the DSProxy.
        fyToken.safeTransferFrom(msg.sender, address(this), fyTokenAmount);

        // Redeem the fyTokens.
        uint256 preUnderlyingBalance = underlying.balanceOf(address(this));
        redemptionPool.redeemFyTokens(fyTokenAmount);

        // Calculate how many underlying have been redeemed.
        uint256 postUnderlyigBalance = underlying.balanceOf(address(this));
        uint256 underlyingAmount = postUnderlyigBalance - preUnderlyingBalance;

        // The underlying is now in the DSProxy, so we relay it to the end user.
        underlying.safeTransfer(msg.sender, underlyingAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function repayBorrow(IFyToken fyToken, uint256 repayAmount) public override {
        // Transfer the fyTokens to the DSProxy.
        fyToken.safeTransferFrom(msg.sender, address(this), repayAmount);

        // Repay the borrow.
        fyToken.repayBorrow(repayAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function sellUnderlyingAndRepayBorrow(
        IFyToken fyToken,
        uint256 underlyingAmount,
        uint256 repayAmount
    ) external override {
        IErc20 underlying = fyToken.underlying();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the Balancer contract to spend underlying if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), EXCHANGE_PROXY_ADDRESS);
        if (allowance < underlyingAmount) {
            underlying.approve(EXCHANGE_PROXY_ADDRESS, type(uint256).max);
        }

        // Prepare the parameters for calling Balancer.
        TokenInterface tokenIn = TokenInterface(address(underlying));
        TokenInterface tokenOut = TokenInterface(address(fyToken));
        uint256 totalAmountOut = repayAmount;
        uint256 maxTotalAmountIn = underlyingAmount;
        uint256 nPools = 1;

        // Recall that Balancer reverts when the swap is not successful.
        uint256 totalAmountIn =
            ExchangeProxyInterface(EXCHANGE_PROXY_ADDRESS).smartSwapExactOut(
                tokenIn,
                tokenOut,
                totalAmountOut,
                maxTotalAmountIn,
                nPools
            );

        // Use the recently bought fyTokens to repay the borrow.
        fyToken.repayBorrow(repayAmount);

        // When we get a better price than the worst that we assumed we would, not all underlying is sold.
        uint256 underlyingDelta = underlyingAmount - totalAmountIn;

        // If the underlying delta is non-zero, send it back to the user.
        if (underlyingDelta > 0) {
            underlying.safeTransfer(msg.sender, underlyingDelta);
        }
    }

    /// @inheritdoc IBatterseaTargetV1
    function supplyUnderlying(IFyToken fyToken, uint256 underlyingAmount) public override {
        uint256 preFyTokenBalance = fyToken.balanceOf(address(this));
        supplyUnderlyingInternal(fyToken, underlyingAmount);

        //Calculate how many fyTokens have been minted.
        uint256 postFyTokenBalance = fyToken.balanceOf(address(this));
        uint256 fyTokenAmount = postFyTokenBalance - preFyTokenBalance;

        // The fyTokens are now in the DSProxy, so we relay them to the end user.
        fyToken.safeTransfer(msg.sender, fyTokenAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function supplyUnderlyingAndRepayBorrow(IFyToken fyToken, uint256 underlyingAmount) external override {
        uint256 preFyTokenBalance = fyToken.balanceOf(address(this));
        supplyUnderlyingInternal(fyToken, underlyingAmount);

        // Calculate how many fyTokens have been minted.
        uint256 postFyTokenBalance = fyToken.balanceOf(address(this));
        uint256 fyTokenAmount = postFyTokenBalance - preFyTokenBalance;

        // Use the newly minted fyTokens to repay the debt.
        fyToken.repayBorrow(fyTokenAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function withdrawCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) public override {
        balanceSheet.withdrawCollateral(fyToken, collateralAmount);

        // The collateral is now in the DSProxy, so we relay it to the end user.
        IErc20 collateral = fyToken.collateral();
        collateral.safeTransfer(msg.sender, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function wrapEthAndDepositCollateral(IBalanceSheet balanceSheet, IFyToken fyToken) public payable override {
        uint256 collateralAmount = msg.value;

        // Convert the received ETH to WETH.
        WethInterface(WETH_ADDRESS).deposit{ value: collateralAmount }();

        // Deposit the collateral into the BalanceSheet contract.
        depositCollateralInternal(balanceSheet, fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function wrapEthAndDepositAndLockCollateral(IBalanceSheet balanceSheet, IFyToken fyToken) public payable override {
        uint256 collateralAmount = msg.value;
        wrapEthAndDepositCollateral(balanceSheet, fyToken);
        balanceSheet.lockCollateral(fyToken, collateralAmount);
    }

    /// @inheritdoc IBatterseaTargetV1
    function wrapEthAndDepositAndLockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable override {
        wrapEthAndDepositAndLockCollateral(balanceSheet, fyToken);
        borrowAndSellFyTokens(fyToken, borrowAmount, underlyingAmount);
    }

    /// INTERNAL FUNCTIONS ///

    /// @dev See the documentation for the public functions that call this internal function.
    function depositCollateralInternal(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) internal {
        // Allow the BalanceSheet contract to spend tokens if allowance not enough.
        IErc20 collateral = fyToken.collateral();
        uint256 allowance = collateral.allowance(address(this), address(balanceSheet));
        if (allowance < collateralAmount) {
            collateral.approve(address(balanceSheet), type(uint256).max);
        }

        // Open the vault if not already open.
        bool isVaultOpen = balanceSheet.isVaultOpen(fyToken, address(this));
        if (isVaultOpen == false) {
            balanceSheet.openVault(fyToken);
        }

        // Deposit the collateral into the BalanceSheet contract.
        balanceSheet.depositCollateral(fyToken, collateralAmount);
    }

    /// @dev See the documentation for the public functions that call this internal function.
    function supplyUnderlyingInternal(IFyToken fyToken, uint256 underlyingAmount) internal {
        IRedemptionPool redemptionPool = fyToken.redemptionPool();
        IErc20 underlying = fyToken.underlying();

        // Transfer the underlying to the DSProxy.
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        // Allow the RedemptionPool contract to spend tokens if allowance not enough.
        uint256 allowance = underlying.allowance(address(this), address(redemptionPool));
        if (allowance < underlyingAmount) {
            underlying.approve(address(redemptionPool), type(uint256).max);
        }

        // Supply the underlying and mint fyTokens.
        redemptionPool.supplyUnderlying(underlyingAmount);
    }
}
