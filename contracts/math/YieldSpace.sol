// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/math/PRBMathSD59x18.sol";

/// @title YieldSpace
/// @author Hifi
library YieldSpace {
    using PRBMathSD59x18 for int256;

    /// @dev 1 divided by the number of seconds in 4 years, as a signed 59.18-decimal fixed-point number.
    /// Computed with 1e18 / 126144000.
    int256 internal constant k = 7927447996;

    /// @notice Fee coefficient used when selling underlying to the pool, as a signed 59.18-decimal fixed-point number.
    /// Computed with (950 * 1e18) / 1000.
    int256 internal constant g1 = 9.5e17;

    /// @notice Fee coefficient used when selling fyToken to the pool, as a signed 59.18-decimal fixed-point number.
    /// Computed with (1000 * 1e18) / 950.
    int256 internal constant g2 = 1052631578947368421;

    /// @dev Number of decimals used in the SD59x18 format.
    int256 internal constant SCALE = 1e18;

    /// @notice Calculates the amount of fyToken a user would get for a given amount of underlying.
    /// @param underlyingReserves underlying reserves amount.
    /// @param fyTokenReserves fyToken reserves amount.
    /// @param underlyingAmount Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return fyTokenAmount Amount of fyToken the user would get.
    function fyTokenOutForUnderlyingIn(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 underlyingAmount,
        int256 timeToMaturity
    ) internal pure returns (int256 fyTokenAmount) {
        int256 a = getA(timeToMaturity.fromInt(), g1);
        unchecked {
            int256 newUnderlyingReserves = underlyingReserves + underlyingAmount;
            require(newUnderlyingReserves >= underlyingReserves, "YieldSpace: too much underlying in");

            // TODO: can this overflow?
            int256 sum = underlyingReserves.pow(a) + fyTokenReserves.pow(a) - newUnderlyingReserves.pow(a);
            fyTokenAmount = fyTokenReserves - sum.pow(a.inv()).toInt();

            // TODO: wut the heck is this? The fee charged by the AMM?
            fyTokenAmount = fyTokenAmount > 1e12 ? fyTokenAmount - 1e12 : int256(0);
        }
    }

    /// @notice Calculates the amount of fyToken a user could sell for a given amount of underlying.
    /// @param underlyingReserves Amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param underlyingAmount Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return fyTokenAmount Amount of fyToken a user could sell.
    function fyTokenInForUnderlyingOut(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 underlyingAmount,
        int256 timeToMaturity
    ) internal pure returns (int256 fyTokenAmount) {
        int256 a = getA(timeToMaturity.fromInt(), g2);
        unchecked {
            require(underlyingAmount <= underlyingReserves, "YieldSpace: too much underlying out");
            int256 newUnderlyingReserves = underlyingReserves - underlyingAmount;

            // TODO: can this overflow?
            int256 sum = underlyingReserves.pow(a) + fyTokenReserves.pow(a) - newUnderlyingReserves.pow(a);
            fyTokenAmount = sum.pow(a.inv()).toInt() - fyTokenReserves;

            // TODO: wut the heck is this? The fee charged by the AMM?
            fyTokenAmount = fyTokenAmount < PRBMathSD59x18.MAX_SD59x18 - 1e12
                ? fyTokenAmount + 1e12
                : PRBMathSD59x18.MAX_SD59x18;
        }
    }

    /// @notice Computes the "a" exponent 1 - g * t, as per the whitepaper.
    /// @param timeToMaturity Time to maturity in seconds, as a signed 59.18-decimal fixed-point number.
    /// @param g The fee coefficient as a signed 59.18-decimal fixed-point number.
    /// @return a The exponent as per the whitepaper.
    function getA(int256 timeToMaturity, int256 g) internal pure returns (int256 a) {
        unchecked {
            // Cannot overflow because the time to maturity is maximum 4 years, or 126144000 in seconds.
            int256 t = k.mul(timeToMaturity);

            // This is doing a = 1 - g * t.
            int256 product = g * t;
            require(SCALE > product, "YieldSpace: too far from maturity");
            a = SCALE - product;
        }
    }

    /// @notice Calculates the amount of underlying a user could sell for a given amount of fyToken.
    /// @param underlyingReserves Amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param fyTokenAmount Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return underlyingAmount Amount of fyToken a user could sell.
    function underlyingInForFyTokenOut(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 fyTokenAmount,
        int256 timeToMaturity
    ) internal pure returns (int256 underlyingAmount) {
        int256 a = getA(timeToMaturity.fromInt(), g1);
        unchecked {
            require(fyTokenAmount <= fyTokenReserves, "YieldSpace: too much fyToken out");
            int256 newFyTokenReserves = fyTokenReserves - fyTokenAmount;

            // TODO: can this overflow?
            int256 sum = underlyingReserves.pow(a) + fyTokenReserves.pow(a) - newFyTokenReserves.pow(a);
            underlyingAmount = sum.pow(a.inv()).toInt() - underlyingReserves;

            // TODO: wut the heck is this? The fee charged by the AMM?
            underlyingAmount = underlyingAmount < PRBMathSD59x18.MAX_SD59x18 - 1e12
                ? underlyingAmount + 1e12
                : PRBMathSD59x18.MAX_SD59x18;
        }
    }

    /// @notice Calculates the amount of underyling a user would get for a given amount of fyToken.
    /// @param underlyingReserves Amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param fyTokenAmount Amount of fyToken to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return underlyingAmount Amount of underlying the user would get.
    function underlyingOutForFyTokenIn(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 fyTokenAmount,
        int256 timeToMaturity
    ) internal pure returns (int256 underlyingAmount) {
        int256 a = getA(timeToMaturity.fromInt(), g2);
        unchecked {
            int256 newFyTokenReserves = fyTokenReserves + fyTokenAmount;
            require(newFyTokenReserves >= fyTokenReserves, "YieldSpace: too much fyToken in");

            // TODO: can this overflow?
            int256 sum = underlyingReserves.pow(a) + fyTokenReserves.pow(a) - newFyTokenReserves.pow(a);
            underlyingAmount = underlyingReserves - sum.pow(a.inv()).toInt();

            // TODO: wut the heck is this? The fee charged by the AMM?
            underlyingAmount = underlyingAmount > 1e12 ? underlyingAmount - 1e12 : int256(0);
        }
    }
}
