// SPDX-License-Identifier: UNLICENSED
// solhint-disable
pragma solidity ^0.8.4;

import "@prb/contracts/token/erc20/IErc20.sol";

import "../external/uniswap/interfaces/IUniswapV3Pool.sol";
import "../oracles/IUniswapV3PriceFeed.sol";
import "../oracles/UniswapV3PriceFeed.sol";

/// @title GodModeUniswapV3PriceFeed
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeUniswapV3PriceFeed is IUniswapV3PriceFeed {
    IUniswapV3PriceFeed internal instance;

    constructor(
        IUniswapV3Pool pool_,
        IErc20 quoteAsset_,
        uint32 twapInterval_
    ) {
        instance = new UniswapV3PriceFeed(pool_, quoteAsset_, twapInterval_);
    }

    function baseAsset() external view returns (IErc20) {
        return instance.baseAsset();
    }

    function decimals() external view returns (uint8) {
        return instance.decimals();
    }

    function description() external view returns (string memory) {
        return instance.description();
    }

    function version() external view returns (uint256) {
        return instance.version();
    }

    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return instance.getRoundData(_roundId);
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return instance.latestRoundData();
    }

    function pool() external view returns (IUniswapV3Pool) {
        return instance.pool();
    }

    function quoteAsset() external view returns (IErc20) {
        return instance.quoteAsset();
    }

    function twapInterval() external view returns (uint32) {
        return instance.twapInterval();
    }

    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        (bool success, ) = address(instance).call{ value: msg.value }(msg.data);
        assert(success);
    }

    receive() external payable {
        (bool success, ) = address(instance).call{ value: msg.value }("");
        assert(success);
    }

    function __godMode_setPool(IUniswapV3Pool newPool) external {
        instance = new UniswapV3PriceFeed(newPool, instance.quoteAsset(), instance.twapInterval());
    }

    function __godMode_setQuoteAsset(IErc20 newQuoteAsset) external {
        instance = new UniswapV3PriceFeed(instance.pool(), newQuoteAsset, instance.twapInterval());
    }

    function __godMode_setTwapInterval(uint32 newTwapInterval) external {
        instance = new UniswapV3PriceFeed(instance.pool(), instance.quoteAsset(), newTwapInterval);
    }
}
