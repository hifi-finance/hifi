/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./GuarantorPoolStorage.sol";

/**
 * @notice GuarantorPoolInterface
 * @author Mainframe
 */
abstract contract GuarantorPoolInterface is GuarantorPoolStorage {
    /*** Non-Constant Functions ***/
    function redeem(address collateral, uint256 endowment) external virtual returns (bool);

    function supply(address collateral, uint256 endowment) external virtual returns (bool);

    /*** Admin Functions ***/

    function _authorizeCollateral(address collateral) external virtual returns (bool);

    function _disapproveCollateral(address collateral) external virtual returns (bool);
}
