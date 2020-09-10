/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./GuarantorPoolStorage.sol";

/**
 * @notice GuarantorPoolInterface
 * @author Mainframe
 */
abstract contract GuarantorPoolInterface is GuarantorPoolStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function redeemEndowment(address collateral, uint256 endowment) external virtual returns (bool);

    function supply(address collateral, uint256 endowment) external virtual returns (bool);

    /*** Admin Functions ***/
    function _authorizeCollateral(address collateral) external virtual returns (bool);

    function _disapproveCollateral(address collateral) external virtual returns (bool);
}
