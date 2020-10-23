/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "../BalanceSheet.sol";
import "../FyTokenInterface.sol";

/**
 * @title GodModeBalanceSheet
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeBalanceSheet is BalanceSheet {
    /* solhint-disable-next-line no-empty-blocks */
    constructor(FintrollerInterface fintroller_) BalanceSheet(fintroller_) {}

    function __godMode_setVaultDebt(
        FyTokenInterface fyToken,
        address account,
        uint256 newVaultDebt
    ) external {
        vaults[address(fyToken)][account].debt = newVaultDebt;
    }

    function __godMode_setVaultFreeCollateral(
        FyTokenInterface fyToken,
        address account,
        uint256 newFreeCollateral
    ) external {
        vaults[address(fyToken)][account].freeCollateral = newFreeCollateral;
    }

    function __godMode_setVaultLockedCollateral(
        FyTokenInterface fyToken,
        address account,
        uint256 newLockedCollateral
    ) external {
        vaults[address(fyToken)][account].lockedCollateral = newLockedCollateral;
    }

    function __godMode_setVaultIsOpen(
        FyTokenInterface fyToken,
        address account,
        bool newIsOpen
    ) external {
        vaults[address(fyToken)][account].isOpen = newIsOpen;
    }
}
