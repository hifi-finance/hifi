/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./FintrollerInterface.sol";
import "./FyTokenInterface.sol";

/// @title RedemptionPoolStorage
/// @author Hifi
abstract contract RedemptionPoolStorage {
    /// @notice The unique Fintroller associated with this contract.
    FintrollerInterface public fintroller;

    /// @notice The amount of the underlying asset available to be redeemed after maturation.
    uint256 public totalUnderlyingSupply;

    /// @notice The unique fyToken associated with this RedemptionPool.
    FyTokenInterface public fyToken;

    /// @notice Indicator that this is a RedemptionPool contract, for inspection.
    bool public constant isRedemptionPool = true;
}
