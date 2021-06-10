// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

/// @title WethInterface
/// @author Hifi
interface WethInterface {
    function deposit() external payable;

    function withdraw(uint256) external;
}
