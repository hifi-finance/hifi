/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @title yTokenInterface
 * @author Mainframe
 */
abstract contract yTokenStorage {
    /**
     * @notice Collateral Erc20 asset for this yToken.
     */
    address public collateral;

    /**
     * @notice Unix timestamp in seconds for when this token expires.
     */
    uint256 public expirationTime;

    /**
     * @notice The pool into which Guarantors of this yToken deposit their capital.
     */
    address public guarantorPool;

    /**
     * @notice Underlying Erc20 asset for this yToken.
     */
    address public underlying;
}
