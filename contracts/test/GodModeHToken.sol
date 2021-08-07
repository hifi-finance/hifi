// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "./GodModeErc20.sol";

/// @title GodModeHToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHToken is GodModeErc20 {
    uint256 public maturity;
    IErc20 public underlying;
    uint256 public underlyingPrecisionScalar;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maturity_,
        IErc20 underlying_
    ) GodModeErc20(name_, symbol_, 18) {
        maturity = maturity_;
        underlying = underlying_;
        underlyingPrecisionScalar = 10**(18 - underlying_.decimals());
    }
}
