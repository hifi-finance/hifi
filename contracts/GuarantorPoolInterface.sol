/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./GuarantorPoolStorage.sol";
import "./YTokenInterface.sol";

/**
 * @notice GuarantorPoolInterface
 * @author Mainframe
 */
abstract contract GuarantorPoolInterface is GuarantorPoolStorage {
    /**
     * CONSTANT FUNCTIONS
     */

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function depositGuaranty(uint256 guarantyAmount) external virtual returns (bool);

    /**
     * EVENTS
     */
    event DepositGuaranty(address indexed guarantor, uint256 amount);
}
