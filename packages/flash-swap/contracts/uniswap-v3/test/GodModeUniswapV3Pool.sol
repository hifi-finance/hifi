// SPDX-License-Identifier: UNLICENSED
// solhint-disable func-name-mixedcase
pragma solidity =0.7.6;

import "../UniswapV3Pool.sol";

/// @title GodModeUniswapV3Pool
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeUniswapV3Pool is UniswapV3Pool {
    function __godMode_setToken0(address newToken0) external {
        token0 = newToken0;
    }

    function __godMode_setToken1(address newToken1) external {
        token1 = newToken1;
    }
}
