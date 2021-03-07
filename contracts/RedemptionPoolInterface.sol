/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./RedemptionPoolStorage.sol";

/// @title RedemptionPoolInterface
/// @author Hifi
abstract contract RedemptionPoolInterface is RedemptionPoolStorage {
    /// EVENTS ///

    event RedeemFyTokens(address indexed account, uint256 fyTokenAmount, uint256 underlyingAmount);

    event SupplyUnderlying(address indexed account, uint256 underlyingAmount, uint256 fyTokenAmount);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Pays the token holder the face value at maturation time.
    ///
    /// @dev Emits a {RedeemFyTokens} event.
    ///
    /// Requirements:
    ///
    /// - Must be called after maturation.
    /// - The amount to redeem cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - There must be enough liquidity in the RedemptionPool.
    ///
    /// @param fyTokenAmount The amount of fyTokens to redeem for the underlying asset.
    /// @return bool true = success, otherwise it reverts.
    function redeemFyTokens(uint256 fyTokenAmount) external virtual returns (bool);

    /// @notice An alternative to the usual minting method that does not involve taking on debt.
    ///
    /// @dev Emits a {SupplyUnderlying} event.
    ///
    /// Requirements:
    ///
    /// - Must be called prior to maturation.
    /// - The amount to supply cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The caller must have allowed this contract to spend `underlyingAmount` tokens.
    ///
    /// @param underlyingAmount The amount of underlying to supply to the RedemptionPool.
    /// @return bool true = success, otherwise it reverts.
    function supplyUnderlying(uint256 underlyingAmount) external virtual returns (bool);
}
