/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./FintrollerInterface.sol";
import "./erc20/Erc20Interface.sol";
import "./math/Exponential.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
contract YTokenStorage is Exponential {
    /*** Structs ***/
    struct Vault {
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /*** Storage Properties ***/

    /**
     * @notice Indicator that this is a YToken contract, for inspection.
     */
    bool public constant isYToken = true;

    /**
     * @notice Collateral Erc20 asset for this YToken.
     */
    Erc20Interface public collateral;

    /**
     * @notice The address of the fintroller contract.
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
     * @notice Underlying Erc20 asset for this YToken.
     */
    Erc20Interface public underlying;

    /**
     * @notice ...
     */
    mapping(address => Vault) public vaults;
}
