/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

import "./ChainlinkOperatorStorage.sol";
import "../external/chainlink/AggregatorV3Interface.sol";

/// @title ChainlinkOperatorInterface
/// @author Hifi
abstract contract ChainlinkOperatorInterface is ChainlinkOperatorStorage {
    /// EVENTS ///

    event DeleteFeed(Erc20Interface indexed asset, AggregatorV3Interface indexed feed);

    event SetFeed(Erc20Interface indexed asset, AggregatorV3Interface indexed feed);

    /// CONSTANT FUNCTIONS ///

    /// @notice Gets the official price for a symbol and adjusts it have 18 decimals instead of the
    /// format used by Chainlink, which has 8 decimals.
    ///
    /// @dev Requirements:
    /// - The upscaled price cannot overflow.
    ///
    /// @param symbol The Erc20 symbol of the token for which to query the price.
    /// @return The upscaled price as a mantissa.
    function getAdjustedPrice(string memory symbol) external view virtual returns (uint256);

    /// @notice Gets the official feed for a symbol.
    /// @param symbol The symbol to return the feed for.
    /// @return (address asset, address id, bool isSet).
    function getFeed(string memory symbol)
        external
        view
        virtual
        returns (
            Erc20Interface,
            AggregatorV3Interface,
            bool
        );

    /// @notice Gets the official price for a symbol in the default format used by Chainlink, which
    /// has 8 decimals.
    ///
    /// @dev Requirements:
    ///
    /// - The feed must have been previously set.
    /// - The price returned by the oracle cannot be zero.
    ///
    /// @param symbol The symbol to fetch the price for.
    /// @return Price denominated in USD, with 8 decimals.
    function getPrice(string memory symbol) public view virtual returns (uint256);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Deletes a previously set Chainlink price feed.
    ///
    /// @dev Emits a {DeleteFeed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The feed must have been previously set.
    ///
    /// @param symbol The Erc20 symbol of the asset to delete the feed for.
    /// @return bool true = success, otherwise it reverts.
    function deleteFeed(string memory symbol) external virtual returns (bool);

    /// @notice Sets a Chainlink price feed. It is not an error to set a feed twice.
    ///
    /// @dev Emits a {SetFeed} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The number of decimals of the feed must be 8.
    ///
    /// @param asset The address of the Erc20 contract for which to get the price.
    /// @param feed The address of the Chainlink price feed contract.
    /// @return bool true = success, otherwise it reverts.
    function setFeed(Erc20Interface asset, AggregatorV3Interface feed) external virtual returns (bool);
}
