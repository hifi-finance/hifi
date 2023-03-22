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

    /// @inheritdoc IUniswapV3PriceFeed
    IUniswapV3Pool public immutable override pool;

    /// @inheritdoc IUniswapV3PriceFeed
    IErc20 public immutable override refAsset;

    /// @inheritdoc IUniswapV3PriceFeed
    uint32 public immutable override twapInterval;

    /// INTERNAL STORAGE ///

    /// @dev The Uniswap V3 pool's token0.
    IErc20 internal immutable token0;

    /// @dev The ERC20 decimals of "token0".
    uint8 internal immutable token0Decimals;

    /// @dev The Uniswap V3 pool's token1.
    IErc20 internal immutable token1;

    /// @dev The ERC20 decimals of "token1".
    uint8 internal immutable token1Decimals;

    /// CONSTRUCTOR ///

    constructor(
        IUniswapV3Pool pool_,
        IErc20 refAsset_,
        uint32 twapInterval_
    ) {
        refAsset = refAsset_;
        token0 = IErc20(pool_.token0());
        token1 = IErc20(pool_.token1());
        if (refAsset != token0 && refAsset != token1) {
            revert IUniswapV3PriceFeed__RefAssetNotInPool(refAsset);
        }
        pool = pool_;
        token0Decimals = token0.decimals();
        token1Decimals = token1.decimals();
        twapInterval = twapInterval_;
    }

    /// @inheritdoc IAggregatorV3
    function decimals() external pure override returns (uint8) {
        return 8;
    }

    /// @inheritdoc IAggregatorV3
    function description() external view override returns (string memory) {
        if (refAsset == token1) {
            return string.concat(token0.symbol(), " / ", refAsset.symbol());
        } else {
            return string.concat(token1.symbol(), " / ", refAsset.symbol());
        }
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
    function getPriceInternal() internal view returns (int256 price) {
        uint32[] memory secondsAgo = new uint32[](2);
        secondsAgo[0] = twapInterval;
        secondsAgo[1] = 0;

        (int56[] memory tickCumulatives, ) = pool.observe(secondsAgo);
        int24 tick = int24((tickCumulatives[1] - tickCumulatives[0]) / int32(twapInterval));
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

        if (refAsset == token1) {
            price = int256(
                FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, (1 << 192) / 10**(8 + token0Decimals)) / 10**token1Decimals
            );
        } else {
            price = int256(FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, (1 << 192) / 10**(8 + token0Decimals)));
            if (price == 0) return int256(10**(16 + token1Decimals));
            price = int256(10**(16 + token1Decimals)) / price;
        }
        if (price == 0) return 1;
    }
}
