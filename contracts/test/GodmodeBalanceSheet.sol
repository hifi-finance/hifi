/* SPDX-License-Identifier: LGPL-3.0-or-later */
/* solhint-disable func-name-mixedcase */
pragma solidity ^0.7.1;

import "../BalanceSheet.sol";
import "../YTokenInterface.sol";

/**
 * @title GodModeBalanceSheet
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeBalanceSheet is BalanceSheet {
    /* solhint-disable-next-line no-empty-blocks */
    constructor(FintrollerInterface fintroller_) BalanceSheet(fintroller_) {}

    function __godMode_setVaultDebt(
        YTokenInterface yToken,
        address account,
        uint256 newVaultDebt
    ) external {
        vaults[address(yToken)][account].debt = newVaultDebt;
    }

    function __godMode_setVaultFreeCollateral(
        YTokenInterface yToken,
        address account,
        uint256 newFreeCollateral
    ) external {
        vaults[address(yToken)][account].freeCollateral = newFreeCollateral;
    }

    function __godMode_setVaultLockedCollateral(
        YTokenInterface yToken,
        address account,
        uint256 newLockedCollateral
    ) external {
        vaults[address(yToken)][account].lockedCollateral = newLockedCollateral;
    }

    function __godMode_setVaultIsOpen(
        YTokenInterface yToken,
        address account,
        bool newIsOpen
    ) external {
        vaults[address(yToken)][account].isOpen = newIsOpen;
    }
}
