/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./OrchestratableStorage.sol";

/**
 * @title OrchestratableInterface
 * @author Mainframe
 */
abstract contract OrchestratableInterface is OrchestratableStorage {
    function renounceConductor() external virtual;

    function transferConductor(address newConductor) external virtual;

    event GrantAccess(address access);
    event TransferConductor(address indexed oldConductor, address indexed newConductor);
}
