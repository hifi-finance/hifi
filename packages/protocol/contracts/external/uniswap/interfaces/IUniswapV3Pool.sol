// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.4;

/// @title IUniswapV3Pool
/// @author Hifi
/// @dev Forked from Uniswap
/// https://github.com/Uniswap/v3-core/blob/v1.0.0/contracts/interfaces/IUniswapV3Factory.sol
interface IUniswapV3Pool {
    function factory() external view returns (address);

    function fee() external view returns (uint24);

    function initialize(uint160 sqrtPriceX96) external;

    function maxLiquidityPerTick() external view returns (uint128);

    function observe(uint32[] calldata secondsAgos)
        external
        view
        returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s);

    function observations(uint256 index)
        external
        view
        returns (
            uint32 blockTimestamp,
            int56 tickCumulative,
            uint160 secondsPerLiquidityCumulativeX128,
            bool initialized
        );

    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );

    function tickSpacing() external view returns (int24);

    function token0() external view returns (address);

    function token1() external view returns (address);
}
