/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../BalanceSheet.sol";
import "../IHToken.sol";

/// @title GodModeBalanceSheet
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeBalanceSheet is BalanceSheet {
    constructor(IFintroller fintroller_) BalanceSheet(fintroller_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_setVaultDebt(
        IHToken hToken,
        address borrower,
        uint256 newVaultDebt
    ) external {
        vaults[hToken][borrower].debt = newVaultDebt;
    }

    function __godMode_setVaultFreeCollateral(
        IHToken hToken,
        address borrower,
        uint256 newFreeCollateral
    ) external {
        vaults[hToken][borrower].freeCollateral = newFreeCollateral;
    }

    function __godMode_setVaultLockedCollateral(
        IHToken hToken,
        address borrower,
        uint256 newLockedCollateral
    ) external {
        vaults[hToken][borrower].lockedCollateral = newLockedCollateral;
    }

    function __godMode_setVaultIsOpen(
        IHToken hToken,
        address borrower,
        bool newIsOpen
    ) external {
        vaults[hToken][borrower].isOpen = newIsOpen;
    }
}
