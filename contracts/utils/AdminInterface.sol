/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./AdminStorage.sol";

/**
 * @title AdminInterface
 * @author Mainframe
 */
abstract contract AdminInterface is AdminStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function renounceAdmin() external virtual;

    function transferAdmin(address newAdmin) external virtual;

    /**
     * EVENTS
     */
    event TransferAdmin(address indexed oldAdmin, address indexed newAdmin);
}
