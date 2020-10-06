/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./Erc20RecoverStorage.sol";
import "../erc20/Erc20Interface.sol";

abstract contract Erc20RecoverInterface is Erc20RecoverStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function recover(Erc20Interface token, uint256 recoverAmount) external virtual;

    function setNonRecoverableTokens(Erc20Interface[] calldata tokens) external virtual;

    /**
     * EVENTS
     */
    event Recover(address indexed admin, Erc20Interface token, uint256 recoverAmount);
    event SetNonRecoverableTokens(address indexed admin, Erc20Interface[] nonRecoverableTokens);
}