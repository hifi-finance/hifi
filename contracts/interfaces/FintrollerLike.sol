// SPDX-License-Identifier: LPGL-3.0-or-later
pragma solidity ^0.7.0;

/// @title FintrollerLike
/// @author Hifi
interface FintrollerLike {
    function oracle() external view returns (address);
}
