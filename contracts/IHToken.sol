/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/token/erc20/IErc20Permit.sol";
import "@paulrberg/contracts/token/erc20/IErc20Recover.sol";

import "./IBalanceSheet.sol";
import "./IFintroller.sol";

/// @title IHToken
/// @author Hifi
/// @notice Zero-coupon bond that tracks an Erc20 underlying asset.
interface IHToken is
    IAdmin, /// no dependency
    IErc20Permit, /// one dependency
    IErc20Recover /// one dependency
{
    /// EVENTS ///

    /// @notice Emitted when tokens are burnt.
    /// @param holder The address of the holder.
    /// @param burnAmount The amount of burnt tokens.
    event Burn(address indexed holder, uint256 burnAmount);

    /// @notice Emitted when tokens are minted.
    /// @param beneficiary The address of the holder.
    /// @param mintAmount The amount of minted tokens.
    event Mint(address indexed beneficiary, uint256 mintAmount);

    /// @notice Emitted when the BalanceSheet is set.
    /// @param admin The address of the admin.
    /// @param oldBalanceSheet The address of the old BalanceSheet.
    /// @param newBalanceSheet The address of the new BalanceSheet.
    event SetBalanceSheet(address indexed admin, IBalanceSheet oldBalanceSheet, IBalanceSheet newBalanceSheet);

    /// PUBLIC CONSTANT FUNCTIONS ///

    /// @notice The unique BalanceSheet associated with this HToken.
    /// @return The BalanceSheet contract.
    function balanceSheet() external view returns (IBalanceSheet);

    /// @notice Unix timestamp in seconds for when this HToken expires.
    function expirationTime() external view returns (uint256);

    /// @notice Checks if the bond matured.
    /// @return bool true = bond matured, otherwise it didn't.
    function isMatured() external view returns (bool);

    /// @notice The Erc20 underlying, or target, asset for this HToken.
    function underlying() external view returns (IErc20);

    /// @notice The ratio between normalized precision (1e18) and the underlying precision.
    function underlyingPrecisionScalar() external view returns (uint256);

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @notice Destroys `burnAmount` tokens from `holder`, reducing the token supply.
    ///
    /// @dev Emits a {Burn} and a {Transfer} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the BalanceSheet contract.
    /// - The amount to burn cannot be zero.
    ///
    /// @param holder The account whose hTokens to burn.
    /// @param burnAmount The amount of hTokens to burn.
    function burn(address holder, uint256 burnAmount) external;

    /// @notice Prints new tokens into existence and assigns them to `beneficiary`, increasing the total supply.
    ///
    /// @dev Emits a {Mint} and a {Transfer} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the BalanceSheet contract.
    /// - The amount to mint cannot be zero.
    ///
    /// @param beneficiary The account to mint the hTokens for.
    /// @param mintAmount The amount of hTokens to print into existence.
    function mint(address beneficiary, uint256 mintAmount) external;

    /// @notice Updates the address of the BalanceSheet contract.
    ///
    /// @dev Throws a {SetBalanceSheet} event.
    ///
    /// Requirements:
    /// - The caller must be the admin.
    ///
    /// @param newBalanceSheet The address of the new BalanceSheet contract.
    function _setBalanceSheet(IBalanceSheet newBalanceSheet) external;
}
