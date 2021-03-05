/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./ChainlinkOperatorStorage.sol";
import "../external/chainlink/AggregatorV3Interface.sol";

/// @title ChainlinkOperatorInterface
/// @author Hifi
abstract contract ChainlinkOperatorInterface is ChainlinkOperatorStorage {
    /// NON-CONSTANT FUNCTIONS ///

    function deleteFeed(string memory symbol) external virtual returns (bool);

    function setFeed(Erc20Interface asset, AggregatorV3Interface feed) external virtual returns (bool);

    /// CONSTANT FUNCTIONS ///

    function getAdjustedPrice(string memory symbol) external view virtual returns (uint256);

    function getFeed(string memory symbol)
        external
        view
        virtual
        returns (
            Erc20Interface,
            AggregatorV3Interface,
            bool
        );

    function getPrice(string memory symbol) public view virtual returns (uint256);

    /// EVENTS ///

    event DeleteFeed(Erc20Interface indexed asset, AggregatorV3Interface indexed feed);

    event SetFeed(Erc20Interface indexed asset, AggregatorV3Interface indexed feed);
}
