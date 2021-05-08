/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "./interfaces/FyTokenLike.sol";

/// @title HifiPoolStorage
/// @author Hifi
abstract contract HifiPoolStorage {
    /// @notice The unix timestamp at which the fyToken expires.
    uint256 public maturity;

    /// @notice The fyToken traded in this pool.
    FyTokenLike public fyToken;

    /// @notice The underlying token traded in this pool.
    Erc20Interface public underlying;
}
