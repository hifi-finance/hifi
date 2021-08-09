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

    /// @notice Whether the AMM pool is being tracked or not.
    ///
    /// @param pool The pool for which reference to return.
    /// @return bool true = pool is tracked, otherwise not.
    function poolIsTracked(IHifiPool pool) external view returns (bool);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Tracks a new AMM pool.
    ///
    /// @dev Emits a {TrackPool} event.
    ///
    /// Requirements:
    /// - The pool shouldn't have already been tracked by registry.
    ///
    /// @param pool The reference to the pool to be tracked.
    function trackPool(IHifiPool pool) external;

    /// @notice Utracks a previously-tracked AMM pool.
    ///
    /// @dev Emits an {UntrackPool} event.
    ///
    /// Requirements:
    /// - The pool should have already been tracked by registry.
    ///
    /// @param pool The reference to the pool to be untracked.
    function untrackPool(IHifiPool pool) external;
}
