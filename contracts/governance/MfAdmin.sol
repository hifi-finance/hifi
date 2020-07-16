/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @title MfAdmin
 * @author Mainframe
 * @notice Contract module which provides a basic access control mechanism, where
 * there is an account (an admin) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the admin account will be the one that deploys the contract. This
 * can later be changed with {transferAdmin}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyAdmin`, which can be applied to your functions to restrict their use to
 * the admin.
 *
 * @dev Forked from OpenZeppelin
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.1.0/contracts/access/Ownable.sol
 */
abstract contract MfAdmin {
    address public admin;

    event TransferAdmin(address indexed previousAdmin, address indexed newAdmin);

    /**
     * @dev Initializes the contract setting the deployer as the initial admin.
     */
    constructor() internal {
        address msgSender = msg.sender;
        admin = msgSender;
        emit TransferAdmin(address(0x00), msgSender);
    }

    /**
     * @dev Throws if called by any account other than the admin.
     */
    modifier isAuthorized() {
        require(admin == msg.sender, "ERR_NOT_AUTHORIZED");
        _;
    }

    /**
     * @dev Leaves the contract without admin. It will not be possible to call
     * `onlyAdmin` functions anymore. Can only be called by the current admin.
     *
     * WARNING: Doing this will leave the contract without an admin,
     * thereby removing any functionality that is only available to the admin.
     */
    function renounceAdmin() public virtual isAuthorized {
        emit TransferAdmin(admin, address(0x00));
        admin = address(0x00);
    }

    /**
     * @dev Transfers the admin of the contract to a new account (`newAdmin`).
     * Can only be called by the current admin.
     * @param newAdmin The acount of the new admin.
     */
    function transferAdmin(address newAdmin) public virtual isAuthorized {
        require(newAdmin != address(0x00), "ERR_SET_ADMIN_ZERO_ADDRESS");
        emit TransferAdmin(admin, newAdmin);
        admin = newAdmin;
    }
}
