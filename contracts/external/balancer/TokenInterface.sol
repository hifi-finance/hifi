/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

/**
 * @title TokenInterface
 * @author Mainframe
 * @dev Forked from Balancer
 * https://github.com/balancer-labs/balancer-registry/blob/3d5fc37/contracts/ExchangeProxy.sol
 */
interface TokenInterface {
    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    function approve(address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function deposit() external payable;

    function withdraw(uint256) external;
}
