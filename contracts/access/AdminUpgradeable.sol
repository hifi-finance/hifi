// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./IAdminUpgradeable.sol";

/// @title AdminUpgradeable
/// @author Hifi
/// @dev Forked from OpenZeppelin
/// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/access/Ownable.sol
contract AdminUpgradeable is
    IAdminUpgradeable, // no dependency
    Initializable // no dependency
{
    /// @inheritdoc IAdminUpgradeable
    address public override admin;

    /// MODIFIERS ///

    /// @notice Throws if called by any account other than the admin.
    modifier onlyAdmin() {
        require(admin == msg.sender, "NOT_ADMIN");
        _;
    }

    /// INITIALIZER ///

    /// @notice Initializes the contract setting the deployer as the initial admin.
    function initialize() public virtual initializer {
        admin = msg.sender;
        emit TransferAdmin(address(0), msg.sender);
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IAdminUpgradeable
    function _renounceAdmin() external virtual override onlyAdmin {
        emit TransferAdmin(admin, address(0));
        admin = address(0);
    }

    /// @inheritdoc IAdminUpgradeable
    function _transferAdmin(address newAdmin) external virtual override onlyAdmin {
        require(newAdmin != address(0), "SET_ADMIN_ZERO_ADDRESS");
        emit TransferAdmin(admin, newAdmin);
        admin = newAdmin;
    }
}
