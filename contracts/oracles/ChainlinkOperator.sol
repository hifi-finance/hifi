/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./ChainlinkOperatorInterface.sol";
import "../external/chainlink/AggregatorV3Interface.sol";

/// @title ChainlinkOperator
/// @author Hifi
/// @notice Manages USD-quoted Chainlink price feeds.
contract ChainlinkOperator is
    ChainlinkOperatorInterface, /// no dependency
    Admin /// two dependencies
{
    // solhint-disable-next-line no-empty-blocks
    constructor() Admin() {}

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc ChainlinkOperatorInterface
    function getAdjustedPrice(string memory symbol) external view override returns (uint256) {
        uint256 price = getPrice(symbol);
        uint256 adjustedPrice = price * pricePrecisionScalar;
        return adjustedPrice;
    }

    /// @inheritdoc ChainlinkOperatorInterface
    function getFeed(string memory symbol)
        external
        view
        override
        returns (
            Erc20Interface,
            AggregatorV3Interface,
            bool
        )
    {
        return (feeds[symbol].asset, feeds[symbol].id, feeds[symbol].isSet);
    }

    /// @inheritdoc ChainlinkOperatorInterface
    function getPrice(string memory symbol) public view override returns (uint256) {
        require(feeds[symbol].isSet, "ERR_FEED_NOT_SET");
        (, int256 intPrice, , , ) = AggregatorV3Interface(feeds[symbol].id).latestRoundData();
        uint256 price = uint256(intPrice);
        require(price > 0, "ERR_PRICE_ZERO");
        return price;
    }

    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc ChainlinkOperatorInterface
    function deleteFeed(string memory symbol) external override onlyAdmin returns (bool) {
        // Checks
        require(feeds[symbol].isSet, "ERR_FEED_NOT_SET");

        // Effects: delete the feed from storage.
        AggregatorV3Interface feed = feeds[symbol].id;
        Erc20Interface asset = feeds[symbol].asset;
        delete feeds[symbol];

        emit DeleteFeed(asset, feed);
        return true;
    }

    /// @inheritdoc ChainlinkOperatorInterface
    function setFeed(Erc20Interface asset, AggregatorV3Interface feed) external override onlyAdmin returns (bool) {
        string memory symbol = asset.symbol();

        // Checks: price precision.
        uint8 decimals = feed.decimals();
        require(decimals == pricePrecision, "ERR_FEED_INCORRECT_DECIMALS");

        // Effects: put the feed into storage.
        feeds[symbol] = Feed({ asset: asset, id: feed, isSet: true });

        emit SetFeed(asset, feed);
        return true;
    }
}
