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

    /// @notice Emitted when the reference asset is not in the pool.
    error IUniswapV3PriceFeed__RefAssetNotInPool(IErc20 refAsset);

    /// @notice Emitted when the TWAP criteria is not satisfied.
    error IUniswapV3PriceFeed__TwapCriteriaNotSatisfied();

    /// @notice Emitted when the pool is the zero address.
    error IUniswapV3PriceFeed__ZeroAddressPool();

    /// CONSTANT FUNCTIONS ///

    /// @notice The base asset for price calculations.
    function baseAsset() external view returns (IErc20);

    /// @notice The Uniswap V3 pool.
    function pool() external view returns (IUniswapV3Pool);

    /// @notice The reference asset for price calculations.
    function refAsset() external view returns (IErc20);

    /// @notice The time window for the TWAP calculation.
    function twapInterval() external view returns (uint32);
}
