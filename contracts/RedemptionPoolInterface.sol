/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./RedemptionPoolStorage.sol";

/**
 * @title RedemptionPoolInterface
 * @author Mainframe
 */
abstract contract RedemptionPoolInterface is RedemptionPoolStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function redeem(uint256 redeemAomunt) external virtual returns (bool);

    function supplyUnderlying(uint256 underlyingAmount) external virtual returns (bool);

    /**
     * EVENTS
     */
    event Redeem(address indexed user, uint256 redeemAmount);

    event SupplyUnderlying(address indexed user, uint256 underlyingAmount);
}
