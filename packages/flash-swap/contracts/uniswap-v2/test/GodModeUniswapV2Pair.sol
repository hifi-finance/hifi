// SPDX-License-Identifier: UNLICENSED
// solhint-disable func-name-mixedcase
pragma solidity =0.5.16;

import "../UniswapV2Pair.sol";

/// @title GodModeUniswapV2Pair
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeUniswapV2Pair is UniswapV2Pair {
    function __godMode_setToken0(address newToken0) external {
        token0 = newToken0;
    }

    function __godMode_setToken1(address newToken1) external {
        token1 = newToken1;
    }
}
