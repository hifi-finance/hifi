// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../access/OwnableUpgradeable.sol";

/// @title GodModeOwnableUpgradeable
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeOwnableUpgradeable is OwnableUpgradeable {
    function __godMode_Ownable_init() public initializer {
        __Ownable_init();
    }
}
