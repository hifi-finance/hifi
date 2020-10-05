/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./RecoverableDepotStorage.sol";
import "../erc20/Erc20Interface.sol";

abstract contract RecoverableDepotInterface is RecoverableDepotStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function setNonRecoverableTokens(Erc20Interface[] calldata tokens) external virtual;

    function recoverErc20(Erc20Interface token, uint256 recoverAmount) external virtual;

    /**
     * EVENTS
     */
    event RecoverToken(address indexed admin, Erc20Interface token, uint256 recoverAmount);
}
