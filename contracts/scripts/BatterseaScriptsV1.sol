/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/math/CarefulMath.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "../BalanceSheetInterface.sol";
import "../FyTokenInterface.sol";
import "../RedemptionPoolInterface.sol";

/**
 * @title BatterseaScriptsV1
 * @author Mainframe
 * @notice Target contract with scripts for the Battersea release of the protocol.
 * @dev Meant to be used via DSProxy.
 */
contract BatterseaScriptsV1 is CarefulMath {
    using SafeErc20 for Erc20Interface;
    using SafeErc20 for FyTokenInterface;

    /**
     * @notice Borrows fyTokens.
     * @param fyToken The address of the FyToken contract.
     * @param borrowAmount The amount of fyTokens to borrow.
     */
    function borrow(FyTokenInterface fyToken, uint256 borrowAmount) public {
        fyToken.borrow(borrowAmount);

        /* TODO: integrate Balancer, market sell fyTokens for underlying, and transfer the underlying instead. */
        fyToken.safeTransfer(msg.sender, borrowAmount);
    }

    /**
     * @notice Deposits and locks collateral into the BalanceSheet contract and
     * draws debt via the FyToken contract.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
     *
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to deposit.
     */
    function depositCollateral(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount
    ) public {
        Erc20Interface collateral = fyToken.collateral();

        /* Transfer the collateral to the DSProxy. */
        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);

        /* Allow the BalanceSheet contract to spend tokens if allowance not enough. */
        uint256 allowance = collateral.allowance(address(this), address(balanceSheet));
        if (allowance < collateralAmount) {
            collateral.approve(address(balanceSheet), uint256(-1));
        }

        /* Open the vault if not already open. */
        bool isVaultOpen = balanceSheet.isVaultOpen(fyToken, address(this));
        if (isVaultOpen == false) {
            balanceSheet.openVault(fyToken);
        }

        /* Deposit the collateral into the BalanceSheet contract. */
        balanceSheet.depositCollateral(fyToken, collateralAmount);
    }

    /**
     * @notice Deposits and locks collateral into the BalanceSheet contract.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
     *
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to deposit and lock.
     */
    function depositAndLockCollateral(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount
    ) external {
        depositCollateral(balanceSheet, fyToken, collateralAmount);
        balanceSheet.lockCollateral(fyToken, collateralAmount);
    }

    /**
     * @notice Deposits and locks collateral into the vault in the BalanceSheet contract
     * and draws debt via the FyToken contract.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
     *
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to deposit and lock.
     * @param borrowAmount The amount of fyTokens to borrow.
     */
    function depositAndLockCollateralAndBorrow(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external {
        depositCollateral(balanceSheet, fyToken, collateralAmount);
        balanceSheet.lockCollateral(fyToken, collateralAmount);
        borrow(fyToken, borrowAmount);
    }

    /**
     * @notice Frees collateral from the vault in the BalanceSheet contract.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to free.
     */
    function freeCollateral(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount
    ) external {
        balanceSheet.freeCollateral(fyToken, collateralAmount);
    }

    /**
     * @notice Frees collateral from the vault and withdraws it from the
     * BalanceSheet contract.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to free and withdraw.
     */
    function freeAndWithdrawCollateral(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount
    ) external {
        balanceSheet.freeCollateral(fyToken, collateralAmount);
        withdrawCollateral(balanceSheet, fyToken, collateralAmount);
    }

    /**
     * @notice Locks collateral in the vault in the BalanceSheet contract.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to free.
     */
    function lockCollateral(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount
    ) external {
        balanceSheet.lockCollateral(fyToken, collateralAmount);
    }

    /**
     * @notice Locks collateral into the vault in the BalanceSheet contract
     * and draws debt via the FyToken contract.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to deposit and lock.
     * @param borrowAmount The amount of fyTokens to borrow.
     */
    function lockCollateralAndBorrow(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external {
        balanceSheet.lockCollateral(fyToken, collateralAmount);
        borrow(fyToken, borrowAmount);
    }

    /**
     * @notice Frees collateral from the vault in the BalanceSheet contract.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     */
    function openVault(BalanceSheetInterface balanceSheet, FyTokenInterface fyToken) external {
        balanceSheet.openVault(fyToken);
    }

    /**
     * @notice Redeems fyTokens in exchange for underlying tokens.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `repayAmount` fyTokens.
     *
     * @param fyToken The address of the FyToken contract.
     * @param fyTokenAmount The amount of fyTokens to redeem.
     */
    function redeemFyTokens(FyTokenInterface fyToken, uint256 fyTokenAmount) public {
        Erc20Interface underlying = fyToken.underlying();
        RedemptionPoolInterface redemptionPool = fyToken.redemptionPool();

        /* Transfer the fyTokens to the DSProxy. */
        fyToken.safeTransferFrom(msg.sender, address(this), fyTokenAmount);

        /* Redeem the fyTokens. */
        uint256 preUnderlyingBalance = underlying.balanceOf(address(this));
        redemptionPool.redeemFyTokens(fyTokenAmount);

        /* Calculate how many underlying have been redeemed. */
        uint256 postUnderlyigBalance = underlying.balanceOf(address(this));
        MathError mathErr;
        uint256 underlyingAmount;
        (mathErr, underlyingAmount) = subUInt(postUnderlyigBalance, preUnderlyingBalance);
        require(mathErr == MathError.NO_ERROR, "ERR_REDEEM_FYTOKENS_MATH_ERROR");

        /* The underlying is now in the DSProxy, so we relay it to the end user. */
        underlying.safeTransfer(msg.sender, underlyingAmount);
    }

    /**
     * @notice Repays the fyToken borrow.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `repayAmount` fyTokens.
     *
     * @param fyToken The address of the FyToken contract.
     * @param repayAmount The amount of fyTokens to repay.
     */
    function repayBorrow(FyTokenInterface fyToken, uint256 repayAmount) public {
        /* Transfer the fyTokens to the DSProxy. */
        fyToken.safeTransferFrom(msg.sender, address(this), repayAmount);

        /* Repay the borrow. */
        fyToken.repayBorrow(repayAmount);
    }

    /**
     * @notice Market sell underlying and repay the borrows via the FyToken contract.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
     *
     * @param fyToken The address of the FyToken contract.
     * @param underlyingAmount The amount of collateral to deposit.
     */
    function sellUnderlyingAndRepayBorrow(FyTokenInterface fyToken, uint256 underlyingAmount) external pure {
        /* TODO: integrate Balancer to market sell underlying. */
        fyToken;
        underlyingAmount;
    }

    /**
     * @notice Supplies the underlying to the RedemptionPool contract and mints fyTokens.
     * @param fyToken The address of the FyToken contract.
     * @param underlyingAmount The amount of underlying to supply.
     */
    function supplyUnderlying(FyTokenInterface fyToken, uint256 underlyingAmount) public {
        uint256 preFyTokenBalance = fyToken.balanceOf(address(this));
        supplyUnderlyingInternal(fyToken, underlyingAmount);

        /* Calculate how many fyTokens have been minted. */
        uint256 postFyTokenBalance = fyToken.balanceOf(address(this));
        MathError mathErr;
        uint256 fyTokenAmount;
        (mathErr, fyTokenAmount) = subUInt(postFyTokenBalance, preFyTokenBalance);
        require(mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_MATH_ERROR");

        /* The fyTokens are now in the DSProxy, so we relay them to the end user. */
        fyToken.safeTransfer(msg.sender, fyTokenAmount);
    }

    /**
     * @notice Supplies the underlying to the RedemptionPool contract, mints fyTokens
     * and repays the borrow.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
     *
     * @param fyToken The address of the FyToken contract.
     * @param underlyingAmount The amount of underlying to supply.
     */
    function supplyUnderlyingAndRepayBorrow(FyTokenInterface fyToken, uint256 underlyingAmount) external {
        uint256 preFyTokenBalance = fyToken.balanceOf(address(this));
        supplyUnderlyingInternal(fyToken, underlyingAmount);

        /* Calculate how many fyTokens have been minted. */
        uint256 postFyTokenBalance = fyToken.balanceOf(address(this));
        MathError mathErr;
        uint256 fyTokenAmount;
        (mathErr, fyTokenAmount) = subUInt(postFyTokenBalance, preFyTokenBalance);
        require(mathErr == MathError.NO_ERROR, "ERR_SUPPLY_UNDERLYING_AND_REPAY_BORROW_MATH_ERROR");

        /* Use the newly minted fyTokens to repay the debt. */
        fyToken.repayBorrow(fyTokenAmount);
    }

    /**
     * @notice Withdraws collateral from the vault in the BalanceSheet contract.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param collateralAmount The amount of collateral to withdraw.
     */
    function withdrawCollateral(
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 collateralAmount
    ) public {
        balanceSheet.withdrawCollateral(fyToken, collateralAmount);

        /* The collateral is now in the DSProxy, so we relay it to the end user. */
        Erc20Interface collateral = fyToken.collateral();
        collateral.safeTransfer(msg.sender, collateralAmount);
    }

    /**
     * INTERNAL FUNCTIONS
     */

    /**
     * @dev See the documentation for the public functions that call this internal function.
     */
    function supplyUnderlyingInternal(FyTokenInterface fyToken, uint256 underlyingAmount) internal {
        RedemptionPoolInterface redemptionPool = fyToken.redemptionPool();
        Erc20Interface underlying = fyToken.underlying();

        /* Transfer the underlying to the DSProxy. */
        underlying.safeTransferFrom(msg.sender, address(this), underlyingAmount);

        /* Allow the RedemptionPool contract to spend tokens if allowance not enough. */
        uint256 allowance = underlying.allowance(address(this), address(redemptionPool));
        if (allowance < underlyingAmount) {
            underlying.approve(address(redemptionPool), uint256(-1));
        }

        /* Supply the underlying and mint fyTokens. */
        redemptionPool.supplyUnderlying(underlyingAmount);
    }
}
