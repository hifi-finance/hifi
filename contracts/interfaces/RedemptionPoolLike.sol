// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

/// @title RedemptionPoolLike
/// @author Hifi
interface RedemptionPoolLike {
    function supplyUnderlying(uint256 underlyingAmount) external returns (bool);
}
