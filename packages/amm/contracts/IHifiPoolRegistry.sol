// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "./IHifiPool.sol";

/// @title IHifiPoolRegistry
/// @author Hifi
interface IHifiPoolRegistry {
    /// EVENTS ///

    event TrackPool(IHifiPool indexed pool);

    event UntrackPool(IHifiPool indexed pool);

    /// CONSTANT FUNCTIONS ///

    /// @notice Whether AMM pool is being tracked or not.
    ///
    /// @param pool The pool for which to make the query.
    /// @return bool true = pool is tracked, otherwise not.
    function pools(address pool) external view returns (bool);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Tracks a new pool.
    ///
    /// @dev Emits a {TrackPool} event.
    ///
    /// Requirements:
    /// - The pool shouldn't have already been tracked.
    ///
    /// @param pool The address of the pool to track.
    function trackPool(IHifiPool pool) external;

    /// @notice Untracks a pool.
    ///
    /// @dev Emits an {UntrackPool} event.
    ///
    /// Requirements:
    /// - The pool should have been tracked.
    ///
    /// @param pool The address of the pool to untrack
    function untrackPool(IHifiPool pool) external;
}
