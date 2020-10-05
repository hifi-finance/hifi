/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "../erc20/Erc20Interface.sol";

abstract contract RecoverableDepotStorage {
    /**
     * @notice The tokens that can be recovered cannot be in this mapping.
     */
    Erc20Interface[] public nonRecoverableTokens;

    /**
     * @notice A flag that signals whether the the non-recoverable tokens were set or not.
     */
    bool public initialized;
}
