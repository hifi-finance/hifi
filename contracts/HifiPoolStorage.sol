/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@hifi/protocol/contracts/FyTokenInterface.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

/// @title HifiPoolStorage
/// @author Hifi
abstract contract HifiPoolStorage {
    /// @notice The unix timestamp at which the fyToken expires.
    uint256 public maturity;

    /// @notice The fyToken traded in this pool.
    FyTokenInterface public fyToken;

    /// @notice The underlying token traded in this pool.
    Erc20Interface public underlying;
}
