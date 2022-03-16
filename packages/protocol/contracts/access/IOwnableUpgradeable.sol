// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.4;

/// @title IOwnableUpgradeable
/// @author Hifi
interface IOwnableUpgradeable {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the caller is not the owner.
    error OwnableUpgradeable__NotOwner(address owner, address caller);

    /// @notice Emitted when setting the owner to the zero address.
    error OwnableUpgradeable__OwnerZeroAddress();

    /// EVENTS ///

    /// @notice Emitted when ownership is transferred.
    /// @param oldOwner The address of the old owner.
    /// @param newOwner The address of the new owner.
    event TransferOwnership(address indexed oldOwner, address indexed newOwner);

    /// CONSTANT FUNCTIONS ///

    /// @notice The address of the owner account or contract.
    /// @return The address of the owner.
    function owner() external view returns (address);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Leaves the contract without an owner, so it will not be possible to call `onlyOwner`
    /// functions anymore.
    ///
    /// WARNING: Doing this will leave the contract without an owner, thereby removing any
    /// functionality that is only available to the owner.
    ///
    /// Requirements:
    ///
    /// - The caller must be the owner.
    function _renounceOwnership() external;

    /// @notice Transfers the owner of the contract to a new account (`newOwner`). Can only be
    /// called by the current owner.
    /// @param newOwner The account of the new owner.
    function _transferOwnership(address newOwner) external;
}
