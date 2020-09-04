/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @notice GuarantorPoolStorage
 * @author Mainframe
 */
abstract contract GuarantorPoolStorage {
    mapping(address => mapping(address => uint256)) public endowments;

    /**
     * @notice Indicator that this is a GuarantorPool contract, for inspection.
     */
    bool public constant isGuarantorPool = true;

    mapping(address => bool) public supportedCollaterals;
}
