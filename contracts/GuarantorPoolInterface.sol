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
    function getShares(uint256 guarantyAmount) public virtual view returns (uint256);

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function depositGuaranty(uint256 guarantyAmount) external virtual returns (bool);

    function withdrawGuarantyAndClutchedCollateral(uint256 shareAmount) external virtual pure returns (bool);

    /**
     * EVENTS
     */
    event DepositGuaranty(address indexed guarantor, uint256 amount);

    event WithdrawGuarantyAndClutchedCollateral(
        address indexed guarantor,
        uint256 guarantyAmount,
        uint256 clutchedCollateralAmount
    );
}
