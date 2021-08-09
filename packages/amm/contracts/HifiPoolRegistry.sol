// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/access/Ownable.sol";

import "./IHifiPool.sol";
import "./IHifiPoolRegistry.sol";

/// @notice Emitted when the pool to be tracked is already tracked.
error HifiPoolRegistry__PoolAlreadyTracked(IHifiPool pool);

/// @notice Emitted when the pool to be untracked is not tracked.
error HifiPoolRegistry__PoolNotTracked(IHifiPool pool);

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
    mapping(IHifiPool => bool) public override poolIsTracked;

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IHifiPoolRegistry
    function trackPool(IHifiPool pool) public override onlyOwner {
        if (poolIsTracked[pool]) {
            revert HifiPoolRegistry__PoolAlreadyTracked(pool);
        }

        poolIsTracked[pool] = true;
        emit TrackPool(pool);
    }

    /// @inheritdoc IHifiPoolRegistry
    function untrackPool(IHifiPool pool) public override onlyOwner {
        if (!poolIsTracked[pool]) {
            revert HifiPoolRegistry__PoolNotTracked(pool);
        }

        poolIsTracked[pool] = false;
        emit UntrackPool(pool);
    }
}
