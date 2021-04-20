/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@hifi/protocol/contracts/FyTokenInterface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

/// @title HifiPoolStorage
/// @author Hifi
abstract contract HifiPoolStorage {
    /// @notice TODO
    uint256 public maturity;

    /// @notice 1 divided by the number seconds in 4 years.
    uint256 public constant k = uint256(1 << 64) / 126144000;

    /// @notice To be used when selling tokens to the pool.
    uint256 public constant g1 = 95.0e18 / 100;
    // uint256 public constant g1 = uint256(950 << 64) / 1000;

    /// @notice To be used when selling fyTokens to the pool.
    uint256 public constant g2 = 100.e18 / 95;
    // uint256 public constant g2 = uint256(1000 << 64) / 950;

    /// @notice TODO
    FyTokenInterface public fyToken;

    /// @notice TODO
    Erc20Interface public underlying;
}
