// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.4;

import "@prb/contracts/token/erc20/IErc20.sol";

import "../external/chainlink/IAggregatorV3.sol";
import "../external/uniswap/interfaces/IUniswapV3Pool.sol";
import "../external/uniswap/libraries/TickMath.sol";
import "../external/uniswap/libraries/FullMath.sol";

/// @title UniswapV3PriceFeed
/// @author Hifi
/// @notice Chainlink-compatible price feed for Uniswap V3 pools.
contract UniswapV3PriceFeed is IAggregatorV3 {
    string internal internalDescription;
    IUniswapV3Pool public immutable pool;
    address public immutable refAsset;
    uint32 public immutable twapInterval;

    constructor(
        string memory description_,
        IUniswapV3Pool pool_,
        address refAsset_,
        uint32 twapInterval_
    ) {
        internalDescription = description_;
        pool = pool_;
        refAsset = refAsset_;
        twapInterval = twapInterval_;
    }

    function decimals() external pure override returns (uint8) {
        return 8;
    }

    function description() external view override returns (string memory) {
        return internalDescription;
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

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
        return (roundId_, getNormalizedPriceInternal(), 0, 0, 0);
    }

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
        return (0, getNormalizedPriceInternal(), 0, block.timestamp, 0);
    }

    /// @dev Returns Chainlink-compatible price data from the Uniswap V3 pool.
    function getNormalizedPriceInternal() internal returns (int256 normalizedPrice) {
        uint32 mTwapInterval = twapInterval;
        uint32[] memory secondsAgo = new uint32[](2);

        secondsAgo[0] = mTwapInterval;
        secondsAgo[1] = 0;

        (int56[] memory tickCumulatives, ) = pool.observe(secondsAgo);

        int24 tick = int24((tickCumulatives[1] - tickCumulatives[0]) / int56(int32(mTwapInterval)));
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

        uint256 feedDecimals = IAggregatorV3(this).decimals();
        uint256 token0Decimals = IErc20(pool.token0()).decimals();
        uint256 token1Decimals = IErc20(pool.token1()).decimals();

        uint256 basePrice = FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, 2**(96 * 2));

        if (refAsset == pool.token1()) {
            normalizedPrice = int256(
                FullMath.mulDiv(basePrice, 10**token0Decimals * 10**feedDecimals, 10**token1Decimals)
            );
        } else {
            normalizedPrice = int256(
                FullMath.mulDiv(10**feedDecimals, 10**token1Decimals, basePrice * 10**token0Decimals)
            );
        }
    }
}
