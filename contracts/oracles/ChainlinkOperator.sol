/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/interfaces/IErc20.sol";

import "../interfaces/IChainlinkOperator.sol";

/// @title ChainlinkOperator
/// @author Hifi
/// @notice Manages USD-quoted Chainlink price feeds.
contract ChainlinkOperator is
    IChainlinkOperator, /// no dependency
    Admin /// two dependencies
{
    struct Feed {
        IErc20 asset;
        AggregatorV3Interface id;
        bool isSet;
    }

    /// @dev Mapping between Erc20 symbols and Feed structs.
    mapping(string => Feed) internal feeds;

    /// @notice Chainlink price precision for USD-quoted data.
    uint256 public override constant pricePrecision = 8;

    /// @notice The ratio between mantissa precision (1e18) and the Chainlink price precision (1e8).
    uint256 public override constant pricePrecisionScalar = 1.0e10;

    constructor() Admin() {
        // solhint-disable-previous-line no-empty-blocks
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IChainlinkOperator
    function getAdjustedPrice(string memory symbol) external view override returns (uint256) {
        uint256 price = getPrice(symbol);
        uint256 adjustedPrice = price * pricePrecisionScalar;
        return adjustedPrice;
    }

    /// @inheritdoc IChainlinkOperator
    function getFeed(string memory symbol)
        external
        view
        override
        returns (
            IErc20,
            AggregatorV3Interface,
            bool
        )
    {
        return (feeds[symbol].asset, feeds[symbol].id, feeds[symbol].isSet);
    }

    /// @inheritdoc IChainlinkOperator
    function getPrice(string memory symbol) public view override returns (uint256) {
        require(feeds[symbol].isSet, "ERR_FEED_NOT_SET");
        (, int256 intPrice, , , ) = AggregatorV3Interface(feeds[symbol].id).latestRoundData();
        uint256 price = uint256(intPrice);
        require(price > 0, "ERR_PRICE_ZERO");
        return price;
    }


    /// NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IChainlinkOperator
    function deleteFeed(string memory symbol) external override onlyAdmin returns (bool) {
        // Checks
        require(feeds[symbol].isSet, "ERR_FEED_NOT_SET");

        // Effects: delete the feed from storage.
        AggregatorV3Interface feed = feeds[symbol].id;
        IErc20 asset = feeds[symbol].asset;
        delete feeds[symbol];

        emit DeleteFeed(asset, feed);
        return true;
    }

    /// @inheritdoc IChainlinkOperator
    function setFeed(IErc20 asset, AggregatorV3Interface feed) external override onlyAdmin returns (bool) {
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
