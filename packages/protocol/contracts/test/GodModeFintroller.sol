// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../core/fintroller/Fintroller.sol";
import "../core/h-token/IHToken.sol";

/// @title GodModeFintroller
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeFintroller is Fintroller {
    function __godMode_setBorrowAllowed(IHToken bond, bool state) external {
        bonds[bond].isBorrowAllowed = state;
    }

    function __godMode_setLiquidateBorrowAllowed(IHToken bond, bool state) external {
        bonds[bond].isLiquidateBorrowAllowed = state;
    }

    function __godMode_setRepayBorrowAllowed(IHToken bond, bool state) external {
        bonds[bond].isRepayBorrowAllowed = state;
    }
}
