// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import "@prb/contracts/token/erc20/IErc20.sol";

import "./IUniswapV3PriceFeed.sol";
import "../external/chainlink/IAggregatorV3.sol";
import "../external/uniswap/interfaces/IUniswapV3Pool.sol";
import "../external/uniswap/libraries/TickMath.sol";
import "../external/uniswap/libraries/FullMath.sol";

/// @title UniswapV3PriceFeed
/// @author Hifi
contract UniswapV3PriceFeed is
    IUniswapV3PriceFeed // one dependency
{
    /// PUBLIC STORAGE ///

    /// @inheritdoc IAggregatorV3
    string public override description;

    /// @inheritdoc IUniswapV3PriceFeed
    IUniswapV3Pool public immutable override pool;

    /// @inheritdoc IUniswapV3PriceFeed
    IErc20 public immutable override refAsset;

    /// @inheritdoc IUniswapV3PriceFeed
    uint32 public immutable override twapInterval;

    /// CONSTRUCTOR ///

    constructor(
        IUniswapV3Pool pool_,
        IErc20 refAsset_,
        uint32 twapInterval_
    ) {
        IErc20 token0 = IErc20(pool_.token0());
        IErc20 token1 = IErc20(pool_.token1());
        if (refAsset_ == token0) {
            description = string.concat(token1.symbol(), " / ", refAsset_.symbol());
        } else if (refAsset_ == token1) {
            description = string.concat(token0.symbol(), " / ", refAsset_.symbol());
        } else {
            revert IUniswapV3PriceFeed__RefAssetNotInPool(refAsset_);
        }
        pool = pool_;
        refAsset = refAsset_;
        twapInterval = twapInterval_;
    }

    /// @inheritdoc IAggregatorV3
    function decimals() external pure override returns (uint8) {
        return 8;
    }

    /// @inheritdoc IAggregatorV3
    function version() external pure override returns (uint256) {
        return 1;
    }

    /// @inheritdoc IAggregatorV3
    function getRoundData(uint80 roundId_)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (roundId_, getPriceInternal(), 0, 0, 0);
    }

    /// @inheritdoc IAggregatorV3
    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, getPriceInternal(), 0, block.timestamp, 0);
    }

    /// @dev Returns Chainlink-compatible price data from the Uniswap V3 pool.
    function getPriceInternal() internal view returns (int256 normalizedPrice) {
        uint32 mTwapInterval = twapInterval;
        uint32[] memory secondsAgo = new uint32[](2);

        secondsAgo[0] = mTwapInterval;
        secondsAgo[1] = 0;

        (int56[] memory tickCumulatives, ) = pool.observe(secondsAgo);

        int24 tick = int24((tickCumulatives[1] - tickCumulatives[0]) / int32(mTwapInterval));
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

        uint256 token0Decimals = IErc20(pool.token0()).decimals();
        uint256 token1Decimals = IErc20(pool.token1()).decimals();

        uint256 basePrice = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, (2**192) / 10**(8 + token0Decimals));

        if (address(refAsset) == pool.token1()) {
            normalizedPrice = int256(basePrice / 10**token1Decimals);
        } else {
            normalizedPrice = int256(10**(16 + token1Decimals) / (basePrice));
        }
    }
}
