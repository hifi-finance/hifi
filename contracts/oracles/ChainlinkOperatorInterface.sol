/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/math/CarefulMath.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./ChainlinkOperatorStorage.sol";
import "../external/chainlink/AggregatorV3Interface.sol";

/**
 * @title ChainlinkOperatorInterface
 * @author Hifi
 */
abstract contract ChainlinkOperatorInterface is ChainlinkOperatorStorage {
    /**
     * EVENTS
     */
    event AddFeed(address indexed feedId, address indexed asset);

    event RemoveFeed(address indexed feedId, address indexed asset);

    /**
     * CONSTANT FUNCTIONS.
     */
    function getFeed(string memory symbol) external view virtual returns (address, address);

    function getAdjustedPrice(string memory symbol) external view virtual returns (uint256);

    function getPrice(string memory symbol) public view virtual returns (uint256);

    /**
     * NON-CONSTANT FUNCTIONS.
     */
    function addFeed(AggregatorV3Interface feed, Erc20Interface asset) external virtual returns (bool);

    function removeFeed(string memory symbol) external virtual returns (bool);
}
