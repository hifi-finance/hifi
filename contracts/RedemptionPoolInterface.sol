/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./RedemptionPoolStorage.sol";

/**
 * @title RedemptionPoolInterface
 * @author Mainframe
 */
abstract contract RedemptionPoolInterface is RedemptionPoolStorage {
    function supplyUnderlying(uint256 underlyingAmount) external virtual returns (bool);

    event SupplyUnderlying(address indexed user, uint256 underlyingAmount);
}
