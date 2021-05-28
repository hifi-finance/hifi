/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/token/erc20/IErc20.sol";
import "@paulrberg/contracts/access/IAdmin.sol";

import "../external/chainlink/IAggregatorV3.sol";

/// @title IChainlinkOperator
/// @author Hifi
/// @notice Interface for the ChainlinkOperator contract
interface IChainlinkOperator {
    /// STRUCTS ///

    struct Feed {
        IErc20 asset;
        IAggregatorV3 id;
        bool isSet;
    }

    /// EVENTS ///

    /// @notice Emitted when a feed is deleted.
    /// @param asset The related asset.
    /// @param feed The related feed.
    event DeleteFeed(IErc20 indexed asset, IAggregatorV3 indexed feed);

    /// @notice Emitted when a feed is set.
    /// @param asset The related asset.
    /// @param feed The related feed.
    event SetFeed(IErc20 indexed asset, IAggregatorV3 indexed feed);

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
    function deleteFeed(string memory symbol) external;

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
    function setFeed(IErc20 asset, IAggregatorV3 feed) external;

    /// CONSTANT FUNCTIONS ///

    /// @notice Gets the official price for a symbol and adjusts it have 18 decimals instead of the
    /// format used by Chainlink, which has 8 decimals.
    ///
    /// @dev Requirements:
    /// - The normalized price cannot overflow.
    ///
    /// @param symbol The Erc20 symbol of the token for which to query the price.
    /// @return The normalized price.
    function getNormalizedPrice(string memory symbol) external view returns (uint256);

    /// @notice Gets the official feed for a symbol.
    /// @param symbol The symbol to return the feed for.
    /// @return (address asset, address id, bool isSet).
    function getFeed(string memory symbol)
        external
        view
        returns (
            IErc20,
            IAggregatorV3,
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
    function getPrice(string memory symbol) external view returns (uint256);

    /// @notice Chainlink price precision for USD-quoted data.
    function pricePrecision() external view returns (uint256);

    /// @notice The ratio between normalized precision (1e18) and the Chainlink price precision (1e8).
    function pricePrecisionScalar() external view returns (uint256);
}
