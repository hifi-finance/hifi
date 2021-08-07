// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity =0.5.16;

import "@uniswap/v2-core/contracts/UniswapV2Pair.sol";

/// @title GodModeUniswapV2Pair
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeUniswapV2Pair is UniswapV2Pair {
    constructor() public UniswapV2Pair() {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_setToken0(address newToken0) external {
        token0 = newToken0;
    }

    function __godMode_setToken1(address newToken1) external {
        token1 = newToken1;
    }
}
