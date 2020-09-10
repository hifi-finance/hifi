/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

/**
 * @notice GuarantorPoolStorage
 * @author Mainframe
 */
abstract contract GuarantorPoolStorage {
    mapping(address => mapping(address => uint256)) public endowments;

    /**
     * @notice Indicator that this is a Guarantor Pool contract, for inspection.
     */
    bool public constant isGuarantorPool = true;

    mapping(address => bool) public supportedCollaterals;
}
