/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenInterface.sol";

/**
 * @title RedemptionPoolStorage
 * @author Mainframe
 */
abstract contract RedemptionPoolStorage {
    /**
     * @notice Indicator that this is a RedemptionPool contract, for inspection.
     */
    bool public constant isRedemptionPool = true;

    /**
     * @notice The amount of the underyling asset available to be redeemed after maturation.
     */
    uint256 public underlyingTotalSupply;

    /**
     * The unique yToken associated with this redemption pool.
     */
    YTokenInterface public yToken;
}
