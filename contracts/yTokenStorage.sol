/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./math/Exponential.sol";

/**
 * @title yTokenInterface
 * @author Mainframe
 */
abstract contract yTokenStorage {
    struct Vault {
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /**
     * @notice Collateral Erc20 asset for this yToken.
     */
    address public collateral;

    /**
     * @notice The surplus of collateral that a borrower must deposit in order to mint new tokens.
     */
    Exp public collateralizationRatio;

    /**
     * @notice Unix timestamp in seconds for when this token expires.
     */
    uint256 public expirationTime;

    /**
     * @notice The pool into which Guarantors of this yToken deposit their capital.
     */
    address public guarantorPool;

    /**
     * @notice Provides price information in USD for the collateral and the underlying asset.
     */
    address public oracle;

    /**
     * @notice Underlying Erc20 asset for this yToken.
     */
    address public underlying;

    /**
     * @notice ...
     */
    mapping(address => Vault) public vaults;
}
