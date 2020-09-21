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
    /**
     * STRUCTS
     */
    struct Vault {
        uint256 debt;
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /**
     * STORAGE PROPERTIES
     */

    /**
     * @notice The global debt registry.
     */
    BalanceSheetInterface public balanceSheet;

    /**
     * @notice The collateral asset backing borows of this yToken.
     */
    Erc20Interface public collateral;

    /**
     * @notice The ratio between mantissa precision (1e18) and the collateral precision.
     */
    uint256 public collateralPrecisionScalar;

    /**
     * @notice The standard number of decimals a yToken has.
     */
    uint8 public constant defaultNumberOfDecimals = 18;

    /**
     * @notice Unix timestamp in seconds for when this token expires.
     */
    uint256 public expirationTime;

    /**
     * @notice The unique Fintroller associated with this contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @notice The unique Guarantor Pool associated with this contract.
     */
    address public guarantorPool;

    /**
     * @notice The unique Redemption Pool associated with this contract.
     */
    RedemptionPoolInterface public redemptionPool;

    /**
     * @notice The underlying, or target, asset for this yToken.
     */
    Erc20Interface public underlying;

    /**
     * @dev One vault for each account.
     */
    mapping(address => Vault) internal vaults;

    /**
     * @notice The ratio between mantissa precision (1e18) and the underlying precision.
     */
    uint256 public underlyingPrecisionScalar;

    /**
     * @notice Indicator that this is a YToken contract, for inspection.
     */
    bool public constant isYToken = true;
}
