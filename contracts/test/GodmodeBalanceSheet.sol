/* SPDX-License-Identifier: LGPL-3.0-or-later */
/* solhint-disable func-name-mixedcase */
pragma solidity ^0.6.10;

import "../BalanceSheet.sol";
import "../YTokenInterface.sol";

/**
 * @title GodModeBalanceSheet
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeBalanceSheet is BalanceSheet {
    /* solhint-disable-next-line no-empty-blocks */
    constructor(FintrollerInterface fintroller_) public BalanceSheet(fintroller_) {}

    function __godMode_setVaultDebt(
        YTokenInterface yToken,
        address user,
        uint256 newVaultDebt
    ) external {
        vaults[address(yToken)][user].debt = newVaultDebt;
    }

    function __godMode_setVaultFreeCollateral(
        YTokenInterface yToken,
        address user,
        uint256 newFreeCollateral
    ) external {
        vaults[address(yToken)][user].freeCollateral = newFreeCollateral;
    }

    function __godMode_setVaultLockedCollateral(
        YTokenInterface yToken,
        address user,
        uint256 newLockedCollateral
    ) external {
        vaults[address(yToken)][user].lockedCollateral = newLockedCollateral;
    }

    function __godMode_setVaultIsOpen(
        YTokenInterface yToken,
        address user,
        bool newIsOpen
    ) external {
        vaults[address(yToken)][user].isOpen = newIsOpen;
    }
}
