/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./RedemptionPoolInterface.sol";
import "./erc20/Erc20Interface.sol";

/**
 * @title YTokenInterface
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
     * @notice Collateral Erc20 asset for this YToken.
     */
    Erc20Interface public collateral;

    /**
     * @notice The address of the risk manager contract.
     */
    FintrollerInterface public fintroller;

    /**
     * @notice Unix timestamp in seconds for when this token expires.
     */
    uint256 public expirationTime;

    /**
     * @notice The pool into which Guarantors of this YToken deposit their capital.
     */
    address public guarantorPool;

    /**
     * @notice Indicator that this is a YToken contract, for inspection.
     */
    bool public constant isYToken = true;

    /**
     * @notice blah
     */
    RedemptionPoolInterface public redemptionPool;

    /**
     * @notice Underlying Erc20 asset for this YToken.
     */
    Erc20Interface public underlying;

    /**
     * @dev ...
     */
    mapping(address => Vault) internal vaults;
}
