// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20.sol";

/// @title FyToken
/// @author Hifi
contract FyToken is Erc20 {
    bool public constant isFyToken = true;

    uint256 public expirationTime;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_
    ) Erc20(name_, symbol_, 18) {
        expirationTime = expirationTime_;
    }
}
