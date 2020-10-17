/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./RedemptionPoolStorage.sol";

/**
 * @title RedemptionPoolInterface
 * @author Mainframe
 */
abstract contract RedemptionPoolInterface is RedemptionPoolStorage {
    /**
     * NON-CONSTANT FUNCTIONS
     */
    function redeemYTokens(uint256 underlyingAmount) external virtual returns (bool);

    function supplyUnderlying(uint256 underlyingAmount) external virtual returns (bool);

    /**
     * EVENTS
     */
    event RedeemYTokens(address indexed account, uint256 yTokenAmount, uint256 underlyingAmount);

    event SupplyUnderlying(address indexed account, uint256 underlyingAmount, uint256 yTokenAmount);
}
