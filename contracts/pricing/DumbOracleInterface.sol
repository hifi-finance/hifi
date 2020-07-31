/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @title DumbOracle
 * @author Mainframe
 * @dev Strictly for testing purposes. Do not use in production.
 */
abstract contract DumbOracleInterface {
    function getEthPriceInUsd() public virtual pure returns (uint256);

    function getDaiPriceInUsd() public virtual pure returns (uint256);

    function getEthPriceInDai() external virtual pure returns (uint256);

    function getPrice(address asset) external virtual pure returns (uint256);
}
