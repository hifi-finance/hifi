/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.8.0;

import "../BalanceSheet.sol";
import "../FyTokenInterface.sol";

/**
 * @title GodModeBalanceSheet
 * @author Hifi
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeBalanceSheet is BalanceSheet {
    /* solhint-disable-next-line no-empty-blocks */
    constructor(FintrollerInterface fintroller_) BalanceSheet(fintroller_) {}

    function __godMode_setVaultDebt(
        FyTokenInterface fyToken,
        address borrower,
        uint256 newVaultDebt
    ) external {
        vaults[fyToken][borrower].debt = newVaultDebt;
    }

    function __godMode_setVaultFreeCollateral(
        FyTokenInterface fyToken,
        address borrower,
        uint256 newFreeCollateral
    ) external {
        vaults[fyToken][borrower].freeCollateral = newFreeCollateral;
    }

    function __godMode_setVaultLockedCollateral(
        FyTokenInterface fyToken,
        address borrower,
        uint256 newLockedCollateral
    ) external {
        vaults[fyToken][borrower].lockedCollateral = newLockedCollateral;
    }

    function __godMode_setVaultIsOpen(
        FyTokenInterface fyToken,
        address borrower,
        bool newIsOpen
    ) external {
        vaults[fyToken][borrower].isOpen = newIsOpen;
    }
}
