/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

/**
 * @title ExponentialStorage
 * @author Mainframe
 * @notice The storage interface ancillary to an Erc20 contract.
 */
abstract contract Erc20Storage {
    /**
     * @notice Returns the number of decimals used to get its user representation.
     */
    uint8 public decimals;

    /**
     * @notice Returns the name of the token.
     */
    string public name;

    /**
     * @notice Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    string public symbol;

    /**
     * @notice Returns the amount of tokens in existence.
     */
    uint256 public totalSupply;

    mapping(address => mapping(address => uint256)) internal allowances;

    mapping(address => uint256) internal balances;
}
