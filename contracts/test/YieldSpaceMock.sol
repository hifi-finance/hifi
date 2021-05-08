// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "../math/YieldSpace.sol";

contract YieldSpaceMock {
    function doGetA(int256 timeToMaturity, int256 g) external pure returns (int256 a) {
        a = YieldSpace.getA(timeToMaturity, g);
    }

    function doFyTokenInForUnderlyingOut(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 underlyingAmount,
        int256 timeToMaturity
    ) external pure returns (int256 fyTokenAmount) {
        fyTokenAmount = YieldSpace.fyTokenInForUnderlyingOut(
            underlyingReserves,
            fyTokenReserves,
            underlyingAmount,
            timeToMaturity
        );
    }

    function doFyTokenOutForUnderlyingIn(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 underlyingAmount,
        int256 timeToMaturity
    ) external pure returns (int256 fyTokenAmount) {
        fyTokenAmount = YieldSpace.fyTokenOutForUnderlyingIn(
            underlyingReserves,
            fyTokenReserves,
            underlyingAmount,
            timeToMaturity
        );
    }

    function doUnderlyingInForFyTokenOut(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 fyTokenAmount,
        int256 timeToMaturity
    ) external pure returns (int256 underlyingAmount) {
        underlyingAmount = YieldSpace.underlyingInForFyTokenOut(
            underlyingReserves,
            fyTokenReserves,
            fyTokenAmount,
            timeToMaturity
        );
    }

    function doUnderlyingOutForFyTokenIn(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 fyTokenAmount,
        int256 timeToMaturity
    ) external pure returns (int256 underlyingAmount) {
        underlyingAmount = YieldSpace.underlyingOutForFyTokenIn(
            underlyingReserves,
            fyTokenReserves,
            fyTokenAmount,
            timeToMaturity
        );
    }
}
