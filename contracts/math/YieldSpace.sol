// SPDX-License-Identifier: GPL-3.0-or-later
// solhint-disable code-complexity, func-name-mixedcase, reason-string, use-forbidden-name
pragma solidity >=0.8.0;

import "@paulrberg/contracts/math/PRBMathSD59x18.sol";

/// @title YieldSpace
/// @author Hifi
library YieldSpace {
    using PRBMathSD59x18 for int256;

    /// @dev 1 divided by the number of seconds in 4 years, as a signed 59.18-decimal fixed-point number.
    /// Computed with 1e18 / 126144000.
    int256 public constant k = 7927447996;

    /// @notice Fee coefficient used when selling underlying to the pool, as a signed 59.18-decimal fixed-point number.
    /// Computed with (950 * 1e18) / 1000.
    int256 public constant g1 = 9.5e17;

    /// @notice Fee coefficient used when selling fyToken to the pool, as a signed 59.18-decimal fixed-point number.
    /// Computed with (1000 * 1e18) / 950.
    int256 public constant g2 = 1052631578947368421;

    /// @dev Number of decimals used in the SD59x18 format.
    int256 internal constant SCALE = 1e18;

    /// @notice Converts a number from basic integer form to signed 59.18-decimal fixed-point.
    function fromInt(int256 x) internal pure returns (int256) {
        unchecked {
            require(x <= PRBMathSD59x18.MAX_SD59x18 / SCALE);
            return x * SCALE;
        }
    }

    /// @notice Computes the "a" exponent 1 - g * t, as per the whitepaper.
    /// @param timeToMaturity The time to maturity in seconds, as a signed 59.18-decimal fixed-point number.
    /// @param g The fee coefficient as a signed 59.18-decimal fixed-point number.
    /// @return a The exponent as per the whitepaper.
    function getA(int256 timeToMaturity, int256 g) public pure returns (int256 a) {
        unchecked {
            // Cannot overflow because the time to maturity is maximum 4 years, or 126144000 in seconds.
            int256 t = k.mul(timeToMaturity);

            // This is doing a = 1 - g * t.
            int256 product = g * t;
            require(SCALE > product, "YieldSpace: too far from maturity");
            a = SCALE - product;
        }
    }

    /// @notice Calculates the amount of fyToken a user would get for given amount of underlying.
    /// @param underlyingReserves underlying reserves amount.
    /// @param fyTokenReserves fyToken reserves amount.
    /// @param underlyingAmount Amount of underlying to be traded.
    /// @param timeToMaturity The time to maturity in seconds.
    /// @return fyTokenAmount The amount of fyToken the user would get.
    function fyTokenOutForUnderlyingIn(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 underlyingAmount,
        int256 timeToMaturity
    ) internal pure returns (int256 fyTokenAmount) {
        int256 a = getA(fromInt(timeToMaturity), g1);
        unchecked {
            int256 newUnderlyingReserves = underlyingReserves + underlyingAmount;
            require(newUnderlyingReserves >= underlyingReserves, "YieldSpace: too much underlying in");

            int256 sum =
                pow(underlyingReserves, a, SCALE) +
                    pow(fyTokenReserves, a, SCALE) -
                    pow(newUnderlyingReserves, a, SCALE);
            fyTokenAmount = fyTokenReserves - pow(sum, SCALE, a);

            // TODO: wut the heck is this? The fee charged by the AMM?
            fyTokenAmount = fyTokenAmount > 1e12 ? fyTokenAmount - 1e12 : int256(0);
        }
    }

    /// @notice Calculates the amount of underyling a user would get for a given amount of fyToken.
    /// @param underlyingReserves Amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param fyTokenAmount Amount of fyToken to be traded.
    /// @param timeToMaturity The time to maturity in seconds.
    /// @return underlyingAmount The amount of underlying the user would get.
    function underlyingOutForFyTokenIn(
        int256 underlyingReserves,
        int256 fyTokenReserves,
        int256 fyTokenAmount,
        int256 timeToMaturity
    ) internal pure returns (int256 underlyingAmount) {
        int256 a = getA(fromInt(timeToMaturity), g2);
        unchecked {
            int256 newFyTokenReserves = fyTokenReserves + fyTokenAmount;
            require(newFyTokenReserves >= fyTokenReserves, "YieldSpace: too much fyToken in");

            int256 sum =
                pow(underlyingReserves, a, SCALE) - pow(newFyTokenReserves, a, SCALE) + pow(fyTokenReserves, a, SCALE);
            underlyingAmount = underlyingReserves - pow(sum, SCALE, a);

            // TODO: wut the heck is this? The fee charged by the AMM?
            underlyingAmount = underlyingAmount > 1e12 ? underlyingAmount - 1e12 : int256(0);
        }
    }

    /// @notice Raise x to the power of y/z.
    /// @dev Based on the insight that x^(y/z) = 2^(log2(x) * y/z).
    /// @param x Number to raise to given power y/z, as a signed 59.18-decimal fixed-point number.
    /// @param y Numerator of the power to raise x to, as a signed 59.18-decimal fixed-point number.
    /// @param z Denominator of the power to raise x to, as a signed 59.18-decimal fixed-point number.
    /// @return result x raised to power y/z, as a signed 59.18-decimal fixed-point number.
    function pow(
        int256 x,
        int256 y,
        int256 z
    ) internal pure returns (int256 result) {
        result = x.log2().mul(y.div(z)).exp2();
    }
}
