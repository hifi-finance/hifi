// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.4;

import "@prb/contracts/token/erc20/IErc20.sol";
import "../external/chainlink/IAggregatorV3.sol";
import "../external/uniswap/interfaces/IUniswapV3Pool.sol";

/// @title IUniswapV3PriceFeed
/// @author Hifi
/// @notice Chainlink-compatible price feed for Uniswap V3 pools.
interface IUniswapV3PriceFeed is IAggregatorV3 {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the quote asset is not in the pool.
    error IUniswapV3PriceFeed__QuoteAssetNotInPool(IErc20 quoteAsset);

    /// @notice Emitted when the TWAP criteria is not satisfied.
    error IUniswapV3PriceFeed__TwapCriteriaNotSatisfied();

    /// @notice Emitted when the max price is less than or equal to zero.
    error IUniswapV3PriceFeed__MaxPriceLessThanOrEqualToZero();

    /// CONSTANT FUNCTIONS ///

    /// @notice The base asset for price calculations.
    function baseAsset() external view returns (IErc20);

    /// @notice The upper price band for the price feed.
    function maxPrice() external view returns (int256);

    /// @notice The Uniswap V3 pool.
    function pool() external view returns (IUniswapV3Pool);

    /// @notice The quote asset for price calculations.
    function quoteAsset() external view returns (IErc20);

    /// @notice The time window for the TWAP calculation.
    function twapInterval() external view returns (uint32);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Updates the max price.
    ///
    /// Requirements:
    ///
    /// - The caller must be the owner.
    /// - The new max price must be greater than zero.
    ///
    /// @param maxPrice_ The new max price.
    function setMaxPrice(int256 maxPrice_) external;
}
