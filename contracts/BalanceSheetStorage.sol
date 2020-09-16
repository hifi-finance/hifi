/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./YTokenInterface.sol";

/**
 * @title BalanceSheetStorage
 * @author Mainframe
 */
abstract contract BalanceSheetStorage {
    /*** Structs ***/
    struct Vault {
        uint256 debt;
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /**
     * @notice The unique Fintroller associated with this contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @dev One vault for each yToken for each user.
     */
    mapping(address => mapping(address => Vault)) internal vaults;

    /**
     * @notice Indicator that this is a BalanceSheet contract, for inspection.
     */
    bool public constant isBalanceSheet = true;
}
