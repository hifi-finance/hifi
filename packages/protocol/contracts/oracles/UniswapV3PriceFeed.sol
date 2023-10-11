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
    IErc20 public immutable override baseAsset;

    /// @inheritdoc IUniswapV3PriceFeed
    IUniswapV3Pool public immutable override pool;

    /// @inheritdoc IUniswapV3PriceFeed
    IErc20 public immutable override quoteAsset;

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

    /// @notice Instantiates the UniswapV3PriceFeed contract.
    /// @param pool_ The address of the Uniswap V3 pool.
    /// @param quoteAsset_ The address of the quote asset for price calculation.
    /// @param twapInterval_ The time window for the TWAP calculation.
    constructor(
        IUniswapV3Pool pool_,
        IErc20 quoteAsset_,
        uint32 twapInterval_
    ) {
        quoteAsset = quoteAsset_;

        token0 = IErc20(pool_.token0());
        token1 = IErc20(pool_.token1());

        // Ensure the quote asset is in the provided pool
        if (quoteAsset != token0 && quoteAsset != token1) {
            revert IUniswapV3PriceFeed__QuoteAssetNotInPool(quoteAsset);
        }

        baseAsset = quoteAsset == token1 ? token0 : token1;
        pool = pool_;

        // Fetch the pool cardinality and most recent observation index.
        (, , uint16 index, uint16 cardinality, , , ) = pool.slot0();

        // Ensure the oldest pool observation is initialized and satisfies the TWAP interval.
        // The next observation at index + 1 is the oldest observation in the ring buffer.
        (uint32 oldestAvailableAge, , , bool initialized) = pool.observations((index + 1) % cardinality);

        // If the next observation is not initialized, all observations of higher indices are also not initialized.
        // Therefore, revert to index 0 to find the oldest initialized observation.
        if (!initialized) (oldestAvailableAge, , , ) = pool.observations(0);

        // Calculate the available TWAP interval.
        uint256 availableTwapInterval = block.timestamp - oldestAvailableAge;

        // Calculate the minimum cardinality, assuming 12.5 second block times.
        uint16 minimumCardinality = uint16((twapInterval_ * 10) / 125);

        // Ensure the available TWAP interval and cardinality satisfy the TWAP criteria.
        if (availableTwapInterval < twapInterval_ || cardinality < minimumCardinality) {
            revert IUniswapV3PriceFeed__TwapCriteriaNotSatisfied();
        }

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
        return string.concat(baseAsset.symbol(), " / ", quoteAsset.symbol());
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

    /// @dev Returns Chainlink-compatible price data from the Uniswap V3 pool. If the quote asset is token1,
    /// the formula used is:
    ///
    ///          sqrtPriceX96^2
    /// price = ----------------
    ///               Q192
    ///
    /// Otherwise, the formula is:
    ///
    ///               Q192
    /// price = ----------------
    ///          sqrtPriceX96^2
    ///
    /// @dev See OracleLibrary.sol in the Uniswap V3 periphery for more details:
    /// https://github.com/Uniswap/v3-periphery/blob/v1.3.0/contracts/libraries/OracleLibrary.sol
    ///
    /// @return price The Chainlink-compatible price of the other asset in terms of the quote asset.
    function getPriceInternal() internal view returns (int256 price) {
        uint32[] memory secondsAgo = new uint32[](2);
        secondsAgo[0] = twapInterval;
        secondsAgo[1] = 0;

        (int56[] memory tickCumulatives, ) = pool.observe(secondsAgo);
        int24 tick = int24((tickCumulatives[1] - tickCumulatives[0]) / int32(twapInterval));
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

        if (quoteAsset == token1) {
            // Calculate the Chainlink-compatible price of token0 in terms of token1
            price = int256(
                FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, (1 << 192) / 10**(8 + token0Decimals)) / 10**token1Decimals
            );
        } else {
            // Calculate the Chainlink-compatible price of token1 in terms of token0
            price = int256(FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, (1 << 192) / 10**(8 + token0Decimals)));
            if (price == 0) return int256(10**(16 + token1Decimals));
            price = int256(10**(16 + token1Decimals)) / price;
        }
        if (price == 0) return 1;
    }
}
