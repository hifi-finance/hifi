// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "./GodModeErc20.sol";

/// @title GodModeHToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHToken is GodModeErc20 {
    uint256 public expirationTime;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_
    ) GodModeErc20(name_, symbol_, 18) {
        expirationTime = expirationTime_;
    }
}
