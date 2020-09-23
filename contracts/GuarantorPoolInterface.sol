/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./GuarantorPoolStorage.sol";

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

    function supplyLiquidity(uint256 amount) external virtual pure returns (bool);

    function withdrawLiquidity(uint256 amount) external virtual pure returns (bool);
}
