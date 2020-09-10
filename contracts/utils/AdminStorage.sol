/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

abstract contract AdminStorage {
    /**
     * @notice The address of the administrator account or contract.
     */
    address public admin;
}
