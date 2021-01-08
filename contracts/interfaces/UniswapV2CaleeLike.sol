// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

interface UniswapV2CaleeLike {
    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external;
}
