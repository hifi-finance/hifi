// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import "./OrchestratableInterface.sol";

/**
 * @author Mainframe
 * @notice Orchestrated static access control between multiple contracts.
 *
 * This should be used as a parent contract of any contract that needs to restrict access to some methods, which should
 * be marked with the `onlyOrchestrated` modifier.
 *
 * During deployment, the contract deployer (`conductor`) can register any contracts that have privileged access
 * by calling `orchestrate`.
 *
 * Once deployment is completed, `conductor` should call `transferConductor(address(0))` to avoid any more contracts
 * ever gaining privileged access.
 *
 * @dev Forked from Alberto Cuesta Cañada
 * https://github.com/albertocuestacanada/Orchestrated/blob/master/contracts/Orchestrated.sol
 */
contract Orchestratable is OrchestratableInterface {
    /**
     * @notice Throws if called by any account other than the conductor.
     */
    modifier onlyConductor() {
        require(conductor == msg.sender, "ERR_NOT_CONDUCTOR");
        _;
    }

    /**
     * @notice Restricts usage to authorized accounts.
     */
    modifier onlyOrchestrated() {
        require(orchestration[msg.sender][msg.sig], "ERR_NOT_ORCHESTRATED");
        _;
    }

    /**
     * @notice Initializes the contract setting the deployer as the initial conductor.
     */
    constructor() {
        conductor = msg.sender;
    }

    /**
     * @notice Adds new orchestrated address.
     * @param account Address of EOA or contract to give access to this contract.
     * @param signature bytes4 signature of the function to be given orchestrated access to.
     */
    function orchestrate(address account, bytes4 signature) external override onlyConductor {
        orchestration[account][signature] = true;
        emit GrantAccess(account);
    }

    /**
     * @notice Leaves the contract without conductor, so it will not be possible to call
     * `onlyConductor` functions anymore.
     *
     * @dev Requirements:
     * - Can only be called by the current conductor.
     */
    function renounceConductor() external virtual override onlyConductor {
        emit TransferConductor(conductor, address(0x00));
        conductor = address(0x00);
    }

    /**
     * @notice Transfers the conductor of the contract to a new account (`newConductor`).
     *
     * @dev Requirements
     * - Can only be called by the current conductor.
     *
     * @param newConductor The acount of the new conductor.
     */
    function transferConductor(address newConductor) external virtual override onlyConductor {
        require(newConductor != address(0x00), "ERR_SET_CONDUCTOR_ZERO_ADDRESS");
        emit TransferConductor(conductor, newConductor);
        conductor = newConductor;
    }
}
