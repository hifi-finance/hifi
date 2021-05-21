// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "../math/YieldSpace.sol";

contract YieldSpaceMock {
    using PRBMathUD60x18 for uint256;

    function doFyTokenInForUnderlyingOut(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingOut,
        uint256 timeToMaturity
    ) external pure returns (uint256 fyTokenIn) {
        fyTokenIn = YieldSpace.fyTokenInForUnderlyingOut(
            normalizedUnderlyingReserves,
            fyTokenReserves,
            normalizedUnderlyingOut,
            timeToMaturity
        );
    }

    function doFyTokenOutForUnderlyingIn(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingIn,
        uint256 timeToMaturity
    ) external pure returns (uint256 fyTokenOut) {
        fyTokenOut = YieldSpace.fyTokenOutForUnderlyingIn(
            normalizedUnderlyingReserves,
            fyTokenReserves,
            normalizedUnderlyingIn,
            timeToMaturity
        );
    }

    function doGetYieldExponent(uint256 timeToMaturity, uint256 g) external pure returns (uint256 a) {
        a = YieldSpace.getYieldExponent(timeToMaturity, g);
    }

    function doUnderlyingInForFyTokenOut(
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenOut,
        uint256 timeToMaturity
    ) external pure returns (uint256 normalizedUnderlyingIn) {
        normalizedUnderlyingIn = YieldSpace.underlyingInForFyTokenOut(
            fyTokenReserves,
            normalizedUnderlyingReserves,
            fyTokenOut,
            timeToMaturity
        );
    }

    function doUnderlyingOutForFyTokenIn(
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenIn,
        uint256 timeToMaturity
    ) external pure returns (uint256 normalizedUnderlyingOut) {
        normalizedUnderlyingOut = YieldSpace.underlyingOutForFyTokenIn(
            fyTokenReserves,
            normalizedUnderlyingReserves,
            fyTokenIn,
            timeToMaturity
        );
    }
}
