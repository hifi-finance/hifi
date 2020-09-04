/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

abstract contract OrchestratableStorage {
    /**
     * @notice The address of the conductor account or contract.
     */
    address public conductor;

    /**
     * @notice The orchestrated contract functions.
     */
    mapping(address => mapping(bytes4 => bool)) public orchestration;
}
