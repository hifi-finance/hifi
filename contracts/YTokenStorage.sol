/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./BalanceSheetInterface.sol";
import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";
import "./erc20/Erc20Interface.sol";

/**
 * @title YTokenStorage
 * @author Mainframe
 */
abstract contract YTokenStorage {
    /*** Structs ***/
    struct Vault {
        uint256 debt;
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /*** Storage Properties ***/

    /**
     * @notice The global debt registry.
     */
    BalanceSheetInterface public balanceSheet;

    /**
     * @notice The collateral asset backing borows of this yToken.
     */
    Erc20Interface public collateral;

    /**
     * @notice The unique Fintroller associated with this contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @notice Unix timestamp in seconds for when this token expires.
     */
    uint256 public expirationTime;

    /**
     * @notice The unique Guarantor Pool associated with this contract.
     */
    address public guarantorPool;

    /**
     * @notice Indicator that this is a YToken contract, for inspection.
     */
    bool public constant isYToken = true;

    /**
     * @notice The unique Redemption Pool associated with this contract.
     */
    RedemptionPoolInterface public redemptionPool;

    /**
     * @notice The underlying, or target, asset for this yToken.
     */
    Erc20Interface public underlying;

    /**
     * @dev One vault for each user.
     */
    mapping(address => Vault) internal vaults;
}
