/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./FintrollerInterface.sol";
import "./YTokenInterface.sol";

/**
 * @title RedemptionPoolStorage
 * @author Mainframe
 */
abstract contract RedemptionPoolStorage {
    /**
     * @notice The unique Fintroller associated with this contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @notice The amount of the underyling asset available to be redeemed after maturation.
     */
    uint256 public underlyingTotalSupply;

    /**
     * The unique yToken associated with this Redemption Pool.
     */
    YTokenInterface public yToken;

    /**
     * @notice Indicator that this is a Redemption Pool contract, for inspection.
     */
    bool public constant isRedemptionPool = true;
}
