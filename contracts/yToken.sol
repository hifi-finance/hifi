/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./yTokenInterface.sol";
import "./erc20/Erc20.sol";
import "./erc20/Erc20Interface.sol";
import "./utils/ReentrancyGuard.sol";

/**
 * @title yToken
 * @author Mainframe
 */
abstract contract yToken is yTokenInterface, Erc20, ReentrancyGuard {
    modifier isMatured() {
        require(block.timestamp >= expirationTime, "ERR_NOT_MATURED");
        _;
    }

    /**
     * @param name_ ERC-20 name of this token
     * @param symbol_ ERC-20 symbol of this token
     * @param decimals_ ERC-20 decimal precision of this token
     * @param underlying_ The address of the underlying asset
     * @param collateral_ The address of the collateral asset
     * @param guarantorPool_ The pool into which Guarantors of this yToken deposit their capital
     * @param expirationTime_ Unix timestamp in seconds for when this token expires
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address underlying_,
        address collateral_,
        address guarantorPool_,
        uint256 expirationTime_
    ) public Erc20(name_, symbol_, decimals_) {
        /* Set underlying and collateral and sanity check them. */
        underlying = underlying_;
        Erc20Interface(underlying_).totalSupply();

        collateral = collateral_;
        Erc20Interface(collateral_).totalSupply();

        /* Set the guarantor pool. */
        guarantorPool = guarantorPool_;

        /* Set the expiration time. */
        expirationTime = expirationTime_;
    }

    /**
     * @notice yTokens resemble zero-coupong bonds, so this function pays the
     * token holder the face value at maturation time.
     */
    function settle() external override isMatured returns (bool) {
        return true;
    }
}
