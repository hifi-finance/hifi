// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "../math/YieldSpace.sol";

contract YieldSpaceMock {
    using PRBMathUD60x18 for uint256;

    function doHTokenInForUnderlyingOut(
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingOut,
        uint256 timeToMaturity
    ) external pure returns (uint256 hTokenIn) {
        hTokenIn = YieldSpace.hTokenInForUnderlyingOut(
            normalizedUnderlyingReserves,
            hTokenReserves,
            normalizedUnderlyingOut,
            timeToMaturity
        );
    }

    function doHTokenOutForUnderlyingIn(
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingIn,
        uint256 timeToMaturity
    ) external pure returns (uint256 hTokenOut) {
        hTokenOut = YieldSpace.hTokenOutForUnderlyingIn(
            normalizedUnderlyingReserves,
            hTokenReserves,
            normalizedUnderlyingIn,
            timeToMaturity
        );
    }

    function doGetYieldExponent(uint256 timeToMaturity, uint256 g) external pure returns (uint256 a) {
        a = YieldSpace.getYieldExponent(timeToMaturity, g);
    }

    function doUnderlyingInForHTokenOut(
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenOut,
        uint256 timeToMaturity
    ) external pure returns (uint256 normalizedUnderlyingIn) {
        normalizedUnderlyingIn = YieldSpace.underlyingInForHTokenOut(
            hTokenReserves,
            normalizedUnderlyingReserves,
            hTokenOut,
            timeToMaturity
        );
    }

    function doUnderlyingOutForHTokenIn(
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenIn,
        uint256 timeToMaturity
    ) external pure returns (uint256 normalizedUnderlyingOut) {
        normalizedUnderlyingOut = YieldSpace.underlyingOutForHTokenIn(
            hTokenReserves,
            normalizedUnderlyingReserves,
            hTokenIn,
            timeToMaturity
        );
    }
}
