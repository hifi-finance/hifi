// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import "@prb/contracts/access/Ownable.sol";
import "@prb/contracts/token/erc20/IErc20.sol";

import "./IChainlinkOperator.sol";

/// @title ChainlinkOperator
/// @author Hifi
contract ChainlinkOperator is
    IChainlinkOperator, // no dependency
    Ownable // one dependency
{
    /// PUBLIC STORAGE ///

    /// @dev Mapping between Erc20 symbols and Feed structs.
    mapping(string => Feed) internal feeds;

    /// @inheritdoc IChainlinkOperator
    uint256 public constant override pricePrecision = 8;

    /// @inheritdoc IChainlinkOperator
    uint256 public constant override pricePrecisionScalar = 1.0e10;

    /// @inheritdoc IChainlinkOperator
    uint256 public override priceStalenessThreshold;

    constructor() Ownable() {
        priceStalenessThreshold = 1 days;
    }

    /// CONSTANT FUNCTIONS ///

    /// @inheritdoc IChainlinkOperator
    function getFeed(string memory symbol)
        external
        view
        override
        returns (
            IErc20,
            IAggregatorV3,
            bool
        )
    {
        return (feeds[symbol].asset, feeds[symbol].id, feeds[symbol].isSet);
    }

    /// @inheritdoc IChainlinkOperator
    function getNormalizedPrice(string memory symbol) external view override returns (uint256) {
        uint256 price = getPrice(symbol);
        uint256 normalizedPrice = price * pricePrecisionScalar;
        return normalizedPrice;
    }

    /// @inheritdoc IChainlinkOperator
    function getPrice(string memory symbol) public view override returns (uint256) {
        if (!feeds[symbol].isSet) {
            revert ChainlinkOperator__FeedNotSet(symbol);
        }
        (, int256 intPrice, , uint256 latestUpdateTimestamp, ) = IAggregatorV3(feeds[symbol].id).latestRoundData();
        if (block.timestamp - latestUpdateTimestamp > priceStalenessThreshold) {
            revert ChainlinkOperator__PriceStale(symbol);
        }
        if (intPrice <= 0) {
            revert ChainlinkOperator__PriceLessThanOrEqualToZero(symbol);
        }
        uint256 price = uint256(intPrice);
        return price;
    }

    /// PUBLIC NON-CONSTANT FUNCTIONS ///

    /// @inheritdoc IChainlinkOperator
    function deleteFeed(string memory symbol) external override onlyOwner {
        // Checks
        if (!feeds[symbol].isSet) {
            revert ChainlinkOperator__FeedNotSet(symbol);
        }

        // Effects: delete the feed from storage.
        IAggregatorV3 feed = feeds[symbol].id;
        IErc20 asset = feeds[symbol].asset;
        delete feeds[symbol];

        emit DeleteFeed(asset, feed);
    }

    /// @inheritdoc IChainlinkOperator
    function setFeed(IErc20 asset, IAggregatorV3 feed) external override onlyOwner {
        string memory symbol = asset.symbol();

        // Checks: price precision.
        uint8 decimals = feed.decimals();
        if (decimals != pricePrecision) {
            revert ChainlinkOperator__DecimalsMismatch(symbol, decimals);
        }

        // Effects: put the feed into storage.
        feeds[symbol] = Feed({ asset: asset, id: feed, isSet: true });

        emit SetFeed(asset, feed);
    }

    /// @inheritdoc IChainlinkOperator
    function setPriceStalenessThreshold(uint256 newPriceStalenessThreshold) external override onlyOwner {
        // Effects: update storage.
        uint256 oldPriceStalenessThreshold = priceStalenessThreshold;
        priceStalenessThreshold = newPriceStalenessThreshold;

        emit SetPriceStalenessThreshold(oldPriceStalenessThreshold, newPriceStalenessThreshold);
    }
}
