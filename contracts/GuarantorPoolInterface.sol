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
    function addLiquidity(uint256 liquidityAmount) external virtual returns (bool);

    function removeLiquidity(uint256 liquidityAmount) external virtual pure returns (bool);

    /**
     * EVENTS
     */
    event AddLiquidity(address indexed guarantor, uint256 amount);
}
