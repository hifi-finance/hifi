/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/interfaces/IErc20Recover.sol";

import "./IFintroller.sol";
import "./IFyToken.sol";

interface IRedemptionPool is IErc20Recover {
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
    function redeemFyTokens(uint256 fyTokenAmount) external returns (bool);

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
    function supplyUnderlying(uint256 underlyingAmount) external returns (bool);


    /// CONSTANT FUNCTIONS ///

    /// @notice The unique Fintroller associated with this contract.
    function fintroller() external view returns (IFintroller);

    /// @notice The amount of the underlying asset available to be redeemed after maturation.
    function totalUnderlyingSupply() external view returns (uint256);

    /// @notice The unique fyToken associated with this RedemptionPool.
    function fyToken() external view returns (IFyToken);

    /// @notice Indicator that this is a RedemptionPool contract, for inspection.
    function isRedemptionPool() external view returns (bool);
}
