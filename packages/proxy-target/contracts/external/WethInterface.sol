// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

/// @title WethInterface
/// @author Hifi
interface WethInterface {
    function deposit() external payable;

    function withdraw(uint256) external;
}
