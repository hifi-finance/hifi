/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/access/Admin.sol";
import "@paulrberg/contracts/math/CarefulMath.sol";
import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./ChainlinkOperatorInterface.sol";
import "../external/chainlink/AggregatorV3Interface.sol";

/**
 * @title ChainlinkOperator
 * @author Hifi
 * @notice Manages USD-quoted Chainlink price feeds.
 */
contract ChainlinkOperator is
    CarefulMath, /* no dependency */
    ChainlinkOperatorInterface, /* no dependency */
    Admin /* two dependencies */
{
    /* solhint-disable-next-line no-empty-blocks */
    constructor() Admin() {}

    /**
     * CONSTANT FUNCTIONS
     */

    /**
     * @notice Get the official feed for a symbol.
     * @param symbol The symbol to return the price feed data for.
     * @return (address asset, address id).
     */
    function getFeed(string memory symbol) external view override returns (address, address) {
        return (feeds[symbol].asset, feeds[symbol].id);
    }

    /**
     * @notice Gets the official price for a symbol and adjusts it have 18 decimals instead of 8.
     *
     * @dev Requirements:
     *
     * - The price returned by the oracle cannot be zero.
     * - The scaled price cannot overflow.
     *
     * @param symbol The Erc20 symbol of the token for which to query the price.
     * @return The upscaled price as a mantissa.
     */
    function getAdjustedPrice(string memory symbol) external view override returns (uint256) {
        /* Get the price from the Chainlink price feed aggregator. */
        uint256 price = getPrice(symbol);
        require(price > 0, "ERR_PRICE_ZERO");

        /* Scale up the price. */
        (MathError mathErr, uint256 adjustedPrice) = mulUInt(price, pricePrecisionScalar);
        require(mathErr == MathError.NO_ERROR, "ERR_GET_ADJUSTED_PRICE_MATH_ERROR");

        return adjustedPrice;
    }

    /**
     * @notice Gets the official price for a symbol in the default format used by Chainlink, which
     * has 8 decimals.
     *
     * @dev Requirements:
     * - The price feed must have been added.
     *
     * @param symbol The symbol to fetch the price for.
     * @return Price denominated in USD, with 8 decimals.
     */
    function getPrice(string memory symbol) public view override returns (uint256) {
        require(feeds[symbol].isAdded, "ERR_FEED_NOT_ADDED");
        (, int256 price, , , ) = AggregatorV3Interface(feeds[symbol].id).latestRoundData();
        return uint256(price);
    }

    /**
     * NON-CONSTANT FUNCTIONS
     */

    /**
     * @notice Add a new Chainlink price feed.
     *
     * @dev Emits an {AddFeed} event.
     *
     * Requirements:
     * - The caller must be the administrator.
     * - The vault must not have been added already.

     * @param feed The address of the Chainlink price feed contract.
     * @param asset The address of the Erc20 contract to add the price feed for.
     * @return true = success, otherwise it reverts.
     */
    function addFeed(AggregatorV3Interface feed, Erc20Interface asset) external override onlyAdmin returns (bool) {
        string memory symbol = asset.symbol();

        /* Checks */
        require(feeds[symbol].isAdded == false, "ERR_FEED_ADDED");

        /* Checks: price feed decimals. */
        uint8 decimals = feed.decimals();
        require(decimals == pricePrecision, "ERR_ADD_FEED_NOT_8_DECIMALS");

        /* Effects: put the feed into storage. */
        feeds[symbol] = Feed({ asset: address(asset), id: address(feed), isAdded: true });

        emit AddFeed(address(feed), address(asset));
        return true;
    }

    /**
     * @notice Remove a previously added Chainlink price feed.
     *
     * @dev Emits a {RemoveFeed} event.
     *
     * Requirements:
     *
     * - The caller must be the administrator.
     * - The vault must have been previously added.
     *
     * @param symbol The symbol of asset to enable price feed of.
     * @return true = success, otherwise it reverts.
     */
    function removeFeed(string memory symbol) external override onlyAdmin returns (bool) {
        /* Checks */
        require(feeds[symbol].isAdded, "ERR_REMOVE_FEED_NOT_ADDED");

        /* Effects: remove the feed from storage. */
        address feedId = feeds[symbol].id;
        address asset = feeds[symbol].asset;
        delete feeds[symbol];

        emit RemoveFeed(feedId, asset);
        return true;
    }
}
