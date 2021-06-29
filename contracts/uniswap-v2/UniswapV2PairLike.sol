// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

interface UniswapV2PairLike {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );
}
