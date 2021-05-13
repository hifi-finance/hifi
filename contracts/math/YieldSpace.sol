// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import "hardhat/console.sol";
import "@paulrberg/contracts/math/PRBMathUD60x18.sol";

/// @title YieldSpace
/// @author Hifi
library YieldSpace {
    using PRBMathUD60x18 for uint256;

    /// @notice The greatest time to maturity for which the g*t < 1 invariant holds, as an unsigned 60.18-decimal
    /// fixed-point number.
    uint256 internal constant CUTOFF_TTM = 119836799 * SCALE;

    /// @notice 1 divided by the number of seconds in four years, as an unsigned 60.18-decimal fixed-point number.
    /// Computed with 1e18 / 126144000.
    uint256 internal constant K = 7927447996;

    /// @notice Fee coefficient used when selling underlying to the pool, as an unsigned 60.18-decimal fixed-point
    /// number. Computed with (950 * 1e18) / 1000.
    uint256 internal constant G1 = 9.5e17;

    /// @notice Fee coefficient used when selling fyToken to the pool, as an unsigned 60.18-decimal fixed-point number.
    /// Computed with (1000 * 1e18) / 950.
    uint256 internal constant G2 = 1052631578947368421;

    /// @notice Number of decimals used in the SD59x18 format.
    uint256 internal constant SCALE = 1e18;

    /// @notice Calculates the amount of fyToken a user could sell for a given amount of underlying.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param normalizedUnderlyingReserves Normalized amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param normalizedUnderlyingOut Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return fyTokenIn Amount of fyToken a user could sell.
    function fyTokenInForUnderlyingOut(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingOut,
        uint256 timeToMaturity
    ) internal pure returns (uint256 fyTokenIn) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G2);
        unchecked {
            require(normalizedUnderlyingReserves >= normalizedUnderlyingOut, "YieldSpace: too much underlying out");
            uint256 newNormalizedUnderlyingReserves = normalizedUnderlyingReserves - normalizedUnderlyingOut;

            // The addition can't overflow and the subtraction can't underflow.
            //   1. The max value the "pow" function can yield is ~2^128 * 10^18.
            //   2. normalizedUnderlyingReserves >= newNormalizedUnderlyingReserves.
            uint256 sum =
                normalizedUnderlyingReserves.fromUint().pow(exponent) +
                    fyTokenReserves.fromUint().pow(exponent) -
                    newNormalizedUnderlyingReserves.fromUint().pow(exponent);

            // In theory, "newFyTokenReserves" should never become less than "fyTokenReserves", because the inverse
            // of the exponent is supraunitary and so sum^(1/exponent) should produce a result bigger than
            // "fyTokenReserves" - that is, in a purely mathematical sense. In practice though, due to the "pow"
            // function having lossy precision, specifically that it produces results slightly smaller than what
            // they should be, it is possible for "newFyTokenReserves" to be less than "fyTokenReserves" in
            // in certain circumstances. For instance, this happens when underlying reserves and
            // and the fyToken reserves have very different magnitudes.
            uint256 newFyTokenReserves = sum.pow(exponent.inv()).toUint();
            require(newFyTokenReserves >= fyTokenReserves, "YieldSpace: lossy precision underflow");
            fyTokenIn = newFyTokenReserves - fyTokenReserves;
        }
    }

    /// @notice Calculates the amount of fyToken a user would get for a given amount of underlying.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param normalizedUnderlyingReserves underlying reserves amount.
    /// @param fyTokenReserves fyToken reserves amount.
    /// @param normalizedUnderlyingIn Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return fyTokenOut Amount of fyToken the user would get.
    function fyTokenOutForUnderlyingIn(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingIn,
        uint256 timeToMaturity
    ) internal pure returns (uint256 fyTokenOut) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G1);
        unchecked {
            uint256 newNormalizedUnderlyingReserves = normalizedUnderlyingReserves + normalizedUnderlyingIn;
            require(
                newNormalizedUnderlyingReserves >= normalizedUnderlyingReserves,
                "YieldSpace: too much underlying in"
            );

            // The first two factors in the right-hand side of the equation. Don't need to guard against overflow
            // because the "pow" function yields a maximum of ~2^128 in fixed-point form.
            uint256 startingReservesFactor =
                normalizedUnderlyingReserves.fromUint().pow(exponent) + fyTokenReserves.fromUint().pow(exponent);

            // The third factor in the right-hand side of the equation.
            uint256 newNormalizedUnderlyingReservesFactor = newNormalizedUnderlyingReserves.fromUint().pow(exponent);
            require(
                startingReservesFactor >= newNormalizedUnderlyingReservesFactor,
                "YieldSpace: insufficient underlying reserves"
            );

            uint256 newFyTokenReserves =
                (startingReservesFactor - newNormalizedUnderlyingReservesFactor).pow(exponent.inv()).toUint();
            // TODO: check if this needs a "require".
            fyTokenOut = fyTokenReserves - newFyTokenReserves;
        }
    }

    /// @notice Computes the yield exponent 1 - g*t, as per the whitepaper.
    /// @dev The reason the cutoff time-to-maturity is less than four years is because the invariant applied is t/g < 1
    /// instead of t < 1.
    /// @param timeToMaturity Time to maturity in seconds, as an unsigned 60.18-decimal fixed-point number.
    /// @param g The fee coefficient as an unsigned 60.18-decimal fixed-point number.
    /// @return exponent The yield exponent, as per the whitepaper, as an unsigned 60.18-decimal fixed-point number.
    function getYieldExponent(uint256 timeToMaturity, uint256 g) internal pure returns (uint256 exponent) {
        require(timeToMaturity <= CUTOFF_TTM, "YieldSpace: too far from maturity");
        unchecked {
            uint256 t = K.mul(timeToMaturity);

            // This cannot get lower than zero due to the require statement above.
            exponent = SCALE - g.mul(t);
        }
    }

    /// @notice Calculates the amount of underlying a user could sell for a given amount of fyToken.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param normalizedUnderlyingReserves Amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param fyTokenOut Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return normalizedUnderlyingIn Amount of fyToken a user could sell.
    function underlyingInForFyTokenOut(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenOut,
        uint256 timeToMaturity
    ) internal pure returns (uint256 normalizedUnderlyingIn) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G1);
        unchecked {
            require(fyTokenReserves >= fyTokenOut, "YieldSpace: too much fyToken out");
            uint256 newFyTokenReserves = fyTokenReserves - fyTokenOut;

            // The addition can't overflow and the subtraction can't underflow.
            //   1. The max value the "pow" function can yield is ~2^128 * 10^18.
            //   2. normalizedUnderlyingReserves >= newNormalizedUnderlyingReserves.
            uint256 sum =
                normalizedUnderlyingReserves.fromUint().pow(exponent) +
                    fyTokenReserves.fromUint().pow(exponent) -
                    newFyTokenReserves.fromUint().pow(exponent);

            // In theory, "newNormalizedUnderlyingReserves" should never become less than "normalizedUnderlyingReserves"
            // because the inverse of the exponent is supraunitary and so sum^(1/exponent) should produce a result
            // bigger than "normalizedUnderlyingReserves" - that is, in a purely mathematical sense. In practice though,
            // due to the "pow" function having lossy precision, specifically that it produces results slightly smaller
            // than what they should be, it is possible in certain  circumstances for "newNormalizedUnderlyingReserves
            // to be less than "normalizedUnderlyingReserves". For instance, this happens when underlying reserves and
            // and the fyToken reserves have very different magnitudes.
            uint256 newNormalizedUnderlyingReserves = sum.pow(exponent.inv()).toUint();
            require(
                newNormalizedUnderlyingReserves >= normalizedUnderlyingReserves,
                "YieldSpace: lossy precision underflow"
            );
            normalizedUnderlyingIn = newNormalizedUnderlyingReserves - normalizedUnderlyingReserves;
        }
    }

    /// @notice Calculates the amount of underyling a user would get for a given amount of fyToken.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param normalizedUnderlyingReserves Amount of underlying reserves.
    /// @param fyTokenReserves Amount of fyToken reserves.
    /// @param fyTokenIn Amount of fyToken to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return normalizedUnderlyingOut Amount of underlying the user would get.
    function underlyingOutForFyTokenIn(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenIn,
        uint256 timeToMaturity
    ) internal pure returns (uint256 normalizedUnderlyingOut) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G2);
        unchecked {
            uint256 newFyTokenReserves = fyTokenReserves + fyTokenIn;
            require(newFyTokenReserves >= fyTokenReserves, "YieldSpace: too much fyToken in");

            // The first two factors in the right-hand side of the equation.
            uint256 startingReservesFactor =
                normalizedUnderlyingReserves.fromUint().pow(exponent) + fyTokenReserves.fromUint().pow(exponent);

            // The third factor in the right-hand side of the equation.
            uint256 newFyTokenReservesFactor = newFyTokenReserves.fromUint().pow(exponent);
            require(startingReservesFactor >= newFyTokenReservesFactor, "YieldSpace: insufficient fyToken reserves");

            uint256 newNormalizedUnderlyingReserves =
                (startingReservesFactor - newFyTokenReservesFactor).pow(exponent.inv()).toUint();
            // TODO: check if this needs a "require".
            normalizedUnderlyingOut = normalizedUnderlyingReserves - newNormalizedUnderlyingReserves;
        }
    }
}
