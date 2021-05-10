// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "../math/YieldSpace.sol";

contract YieldSpaceMock {
    function doFyTokenInForUnderlyingOut(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 underlyingAmount,
        uint256 timeToMaturity
    ) external pure returns (uint256 fyTokenAmount) {
        fyTokenAmount = YieldSpace.fyTokenInForUnderlyingOut(
            underlyingReserves,
            fyTokenReserves,
            underlyingAmount,
            timeToMaturity
        );
    }

    function doFyTokenOutForUnderlyingIn(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 underlyingAmount,
        uint256 timeToMaturity
    ) external pure returns (uint256 fyTokenAmount) {
        fyTokenAmount = YieldSpace.fyTokenOutForUnderlyingIn(
            underlyingReserves,
            fyTokenReserves,
            underlyingAmount,
            timeToMaturity
        );
    }

    function doGetYieldExponent(uint256 timeToMaturity, uint256 g) external pure returns (uint256 a) {
        a = YieldSpace.getYieldExponent(timeToMaturity, g);
    }

    function doUnderlyingInForFyTokenOut(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenAmount,
        uint256 timeToMaturity
    ) external pure returns (uint256 underlyingAmount) {
        underlyingAmount = YieldSpace.underlyingInForFyTokenOut(
            underlyingReserves,
            fyTokenReserves,
            fyTokenAmount,
            timeToMaturity
        );
    }

    function doUnderlyingOutForFyTokenIn(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenAmount,
        uint256 timeToMaturity
    ) external pure returns (uint256 underlyingAmount) {
        underlyingAmount = YieldSpace.underlyingOutForFyTokenIn(
            underlyingReserves,
            fyTokenReserves,
            fyTokenAmount,
            timeToMaturity
        );
    }
}
