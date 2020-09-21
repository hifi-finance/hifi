/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./OrchestratableStorage.sol";

/**
 * @title OrchestratableInterface
 * @author Mainframe
 */
abstract contract OrchestratableInterface is OrchestratableStorage {
    /**
     * NON-CONSTANTS FUNCTIONS
     */
    function orchestrate(address account, bytes4 signature) external virtual;

    function renounceConductor() external virtual;

    function transferConductor(address newConductor) external virtual;

    /**
     * EVENTS
     */
    event GrantAccess(address access);

    event TransferConductor(address indexed oldConductor, address indexed newConductor);
}
