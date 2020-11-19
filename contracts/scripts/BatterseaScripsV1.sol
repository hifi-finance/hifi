/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "@paulrberg/contracts/token/erc20/SafeErc20.sol";

import "../BalanceSheetInterface.sol";
import "../FyTokenInterface.sol";

/**
 * @title BatterseaScripsV1
 * @author Mainframe
 * @notice Target contract with scripts for the Battersea release of the protocol.
 * @dev Meant to be used via DSProxy.
 */
contract BatterseaScripsV1 {
    using SafeErc20 for Erc20Interface;

    /**
     * @notice Deposits and locks collateral into the Balance Sheet and draws debt
     * via the FyToken.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
     *
     * @param collateral The address of the collateral Erc20 contract.
     * @param collateralAmount The amount of collateral to deposit.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @return true = success, otherwise it reverts.
     */
    function depositCollateral(
        BalanceSheetInterface balanceSheet,
        Erc20Interface collateral,
        uint256 collateralAmount,
        FyTokenInterface fyToken
    ) public returns (bool) {
        /* Transfer the collateral to the DSProxy. */
        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);

        /* Open the vault if not already open. */
        bool isVaultOpen = balanceSheet.isVaultOpen(fyToken, msg.sender);
        if (isVaultOpen == false) {
            balanceSheet.openVault(fyToken);
        }

        /* Allow the Balance Sheet to spend tokens if allowance not enough. */
        uint256 allowance = collateral.allowance(msg.sender, address(balanceSheet));
        if (allowance < collateralAmount) {
            collateral.approve(address(balanceSheet), uint256(-1));
        }

        /* Deposit the collateral into the Balance Sheet. */
        balanceSheet.depositCollateral(fyToken, collateralAmount);

        return true;
    }

    /**
     * @notice Deposits and locks collateral into the Balance Sheet and draws debt
     * via the FyToken.
     *
     * @dev Requirements:
     * - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
     *
     * @param collateral The address of the collateral Erc20 contract.
     * @param collateralAmount The amount of collateral to deposit.
     * @param balanceSheet The address of the BalanceSheet contract.
     * @param fyToken The address of the FyToken contract.
     * @param borrowAmount The amount of fyTokens to borrow.
     * @return true = success, otherwise it reverts.
     */
    function depositAndLockCollateralAndBorrow(
        Erc20Interface collateral,
        uint256 collateralAmount,
        BalanceSheetInterface balanceSheet,
        FyTokenInterface fyToken,
        uint256 borrowAmount
    ) external returns (bool) {
        depositCollateral(balanceSheet, collateral, collateralAmount, fyToken);

        balanceSheet.lockCollateral(fyToken, collateralAmount);

        fyToken.borrow(borrowAmount);

        return true;
    }
}
