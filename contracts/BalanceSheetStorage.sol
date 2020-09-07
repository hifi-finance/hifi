/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

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
     * @notice Indicator that this is a BalanceSheet contract, for inspection.
     */
    bool public constant isBalanceSheet = true;

    /**
     * @dev One vault for each yToken for each user.
     */
    mapping(address => mapping(address => Vault)) internal vaults;
}
