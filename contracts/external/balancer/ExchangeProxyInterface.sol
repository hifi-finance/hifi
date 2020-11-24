/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";

/**
 * @title ExchangeProxyInterface
 * @author Mainframe
 */
interface ExchangeProxyInterface {
    function smartSwapExactIn(
        Erc20Interface tokenIn,
        Erc20Interface tokenOut,
        uint256 totalAmountIn,
        uint256 minTotalAmountOut,
        uint256 nPools
    ) external payable returns (uint256 totalAmountOut);

    function smartSwapExactOut(
        Erc20Interface tokenIn,
        Erc20Interface tokenOut,
        uint256 totalAmountOut,
        uint256 maxTotalAmountIn,
        uint256 nPools
    ) external payable returns (uint256 totalAmountIn);
}
