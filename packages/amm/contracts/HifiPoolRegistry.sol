// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@prb/contracts/access/Ownable.sol";

import "./IHifiPool.sol";
import "./IHifiPoolRegistry.sol";

/// @title HifiPoolRegistry
/// @author Hifi
contract HifiPoolRegistry is
    Ownable, // one dependency
    IHifiPoolRegistry // one dependency
{
    /// CONSTRUCTOR ///

    constructor() Ownable() {
        // solhint-disable-previous-line no-empty-blocks
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiPoolRegistry
    mapping(address => bool) public override pools;

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiPoolRegistry
    function trackPool(IHifiPool pool) public override onlyOwner {
        if (pools[address(pool)]) {
            revert HifiPoolRegistry__PoolAlreadyTracked(pool);
        }

        pools[address(pool)] = true;
        emit TrackPool(pool);
    }

    /// @inheritdoc IHifiPoolRegistry
    function untrackPool(IHifiPool pool) public override onlyOwner {
        if (!pools[address(pool)]) {
            revert HifiPoolRegistry__PoolNotTracked(pool);
        }

        pools[address(pool)] = false;
        emit UntrackPool(pool);
    }
}
