// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.4;

import "prb-math/contracts/PRBMathUD60x18.sol";

/// @notice Emitted when selling underlying and the resultant hToken reserves would be too low.
error YieldSpace__HTokenOutForUnderlyingInReservesFactorsUnderflow(
    uint256 startingReservesFactor,
    uint256 newNormalizedUnderlyingReservesFactor
);

/// @notice Emitted when the hToken reserves added to the hToken out overflows uint256.
error YieldSpace__HTokenReservesOverflow(uint256 hTokenReserves, uint256 hTokenIn);

/// @notice Emitted when there is not enough hTokens in the pool for how much should go out.
error YieldSpace__HTokenReservesUnderflow(uint256 hTokenReserves, uint256 hTokenOut);

/// @notice Emitted when the math calculations produce an underflow that in a pure mathematical sense
/// should not exist.
error YieldSpace__LossyPrecisionUnderflow(uint256 minuend, uint256 subtrahend);

/// @notice Emitted when the time to maturity is beyond the cut-off point.
error YieldSpace__TooFarFromMaturity(uint256 timeToMaturity);

/// @notice Emitted when selling underlying and the resultant hToken reserves would be too low.
error YieldSpace__UnderlyingOutForHTokenInReservesFactorsUnderflow(
    uint256 startingReservesFactor,
    uint256 newHTokenReservesFactor
);

/// @notice Emitted when the normalized underlying reserves added to the normalized underlying in overflows uint256.
error YieldSpace__UnderlyingReservesOverflow(uint256 normalizedUnderlyingReserves, uint256 normalizedUnderlyingIn);

/// @notice Emitted when there is not enough underlying in the pool for how much should go out.
error YieldSpace__UnderlyingReservesUnderflow(uint256 normalizedUnderlyingReserves, uint256 normalizedUnderlyingOut);

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

    /// @notice Fee coefficient used when selling hToken to the pool, as an unsigned 60.18-decimal fixed-point number.
    /// Computed with (1000 * 1e18) / 950.
    uint256 internal constant G2 = 1052631578947368421;

    /// @notice Number of decimals used in the SD59x18 format.
    uint256 internal constant SCALE = 1e18;

    /// @notice Calculates the amount of hToken a user could sell for a given amount of underlying.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param normalizedUnderlyingReserves Normalized amount of underlying reserves.
    /// @param hTokenReserves Amount of hToken reserves.
    /// @param normalizedUnderlyingOut Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return hTokenIn Amount of hToken a user could sell.
    function hTokenInForUnderlyingOut(
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingOut,
        uint256 timeToMaturity
    ) internal pure returns (uint256 hTokenIn) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G2);
        unchecked {
            if (normalizedUnderlyingReserves < normalizedUnderlyingOut) {
                revert YieldSpace__UnderlyingReservesUnderflow(normalizedUnderlyingReserves, normalizedUnderlyingOut);
            }
            uint256 newNormalizedUnderlyingReserves = normalizedUnderlyingReserves - normalizedUnderlyingOut;

            // The addition can't overflow and the subtraction can't underflow.
            //   1. The max value the "pow" function can yield is ~2^128 * 10^18.
            //   2. normalizedUnderlyingReserves >= newNormalizedUnderlyingReserves.
            uint256 sum = normalizedUnderlyingReserves.fromUint().pow(exponent) +
                hTokenReserves.fromUint().pow(exponent) -
                newNormalizedUnderlyingReserves.fromUint().pow(exponent);

            // In theory, "newHTokenReserves" should never become less than "hTokenReserves", because the inverse
            // of the exponent is supraunitary and so sum^(1/exponent) should produce a result bigger than
            // "hTokenReserves" - that is, in a purely mathematical sense. In practice though, due to the "pow"
            // function having lossy precision, specifically that it produces results slightly smaller than what
            // they should be, it is possible for "newHTokenReserves" to be less than "hTokenReserves" in
            // in certain circumstances. For instance, when underlying reserves and the hToken reserves
            // have very different magnitudes.
            uint256 newHTokenReserves = sum.pow(exponent.inv()).toUint();
            if (newHTokenReserves < hTokenReserves) {
                revert YieldSpace__LossyPrecisionUnderflow(newHTokenReserves, hTokenReserves);
            }
            hTokenIn = newHTokenReserves - hTokenReserves;
        }
    }

    /// @notice Calculates the amount of hToken a user would get for a given amount of underlying.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param normalizedUnderlyingReserves underlying reserves amount.
    /// @param hTokenReserves hToken reserves amount.
    /// @param normalizedUnderlyingIn Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return hTokenOut Amount of hToken the user would get.
    function hTokenOutForUnderlyingIn(
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingIn,
        uint256 timeToMaturity
    ) internal pure returns (uint256 hTokenOut) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G1);
        unchecked {
            uint256 newNormalizedUnderlyingReserves = normalizedUnderlyingReserves + normalizedUnderlyingIn;
            if (normalizedUnderlyingReserves > newNormalizedUnderlyingReserves) {
                revert YieldSpace__UnderlyingReservesOverflow(normalizedUnderlyingReserves, normalizedUnderlyingIn);
            }

            // The first two factors in the right-hand side of the equation. There is no need to guard against overflow
            // because the "pow" function yields a maximum of ~2^128 in fixed-point representation.
            uint256 startingReservesFactor = normalizedUnderlyingReserves.fromUint().pow(exponent) +
                hTokenReserves.fromUint().pow(exponent);

            // The third factor in the right-hand side of the equation.
            uint256 newNormalizedUnderlyingReservesFactor = newNormalizedUnderlyingReserves.fromUint().pow(exponent);
            if (startingReservesFactor < newNormalizedUnderlyingReservesFactor) {
                revert YieldSpace__HTokenOutForUnderlyingInReservesFactorsUnderflow(
                    startingReservesFactor,
                    newNormalizedUnderlyingReservesFactor
                );
            }

            uint256 newHTokenReserves = (startingReservesFactor - newNormalizedUnderlyingReservesFactor)
            .pow(exponent.inv())
            .toUint();
            if (hTokenReserves < newHTokenReserves) {
                revert YieldSpace__LossyPrecisionUnderflow(hTokenReserves, newHTokenReserves);
            }
            hTokenOut = hTokenReserves - newHTokenReserves;
        }
    }

    /// @notice Computes the yield exponent 1 - g*t, as per the whitepaper.
    /// @dev The reason the cutoff time to maturity is less than four years is because the invariant applied is t/g < 1
    /// instead of t < 1.
    /// @param timeToMaturity Time to maturity in seconds, as an unsigned 60.18-decimal fixed-point number.
    /// @param g The fee coefficient as an unsigned 60.18-decimal fixed-point number.
    /// @return exponent The yield exponent, as per the whitepaper, as an unsigned 60.18-decimal fixed-point number.
    function getYieldExponent(uint256 timeToMaturity, uint256 g) internal pure returns (uint256 exponent) {
        if (timeToMaturity > CUTOFF_TTM) {
            revert YieldSpace__TooFarFromMaturity(timeToMaturity);
        }
        unchecked {
            uint256 t = K.mul(timeToMaturity);

            // This cannot get lower than zero due to the require statement above.
            exponent = SCALE - g.mul(t);
        }
    }

    /// @notice Calculates the amount of underlying a user could sell for a given amount of hToken.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param hTokenReserves Amount of hToken reserves.
    /// @param normalizedUnderlyingReserves Amount of underlying reserves.
    /// @param hTokenOut Amount of underlying to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return normalizedUnderlyingIn Amount of hToken a user could sell.
    function underlyingInForHTokenOut(
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenOut,
        uint256 timeToMaturity
    ) internal pure returns (uint256 normalizedUnderlyingIn) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G1);
        unchecked {
            if (hTokenReserves < hTokenOut) {
                revert YieldSpace__HTokenReservesUnderflow(hTokenReserves, hTokenOut);
            }
            uint256 newHTokenReserves = hTokenReserves - hTokenOut;

            // The addition can't overflow and the subtraction can't underflow.
            //   1. The max value the "pow" function can yield is ~2^128 * 10^18.
            //   2. hTokenReserves >= newHTokenReserves.
            uint256 sum = hTokenReserves.fromUint().pow(exponent) +
                normalizedUnderlyingReserves.fromUint().pow(exponent) -
                newHTokenReserves.fromUint().pow(exponent);

            // In theory, "newNormalizedUnderlyingReserves" should never become less than "normalizedUnderlyingReserves"
            // because the inverse of the exponent is supraunitary and so sum^(1/exponent) should produce a result
            // bigger than "normalizedUnderlyingReserves" - that is, in a purely mathematical sense. In practice though,
            // due to the "pow" function having lossy precision, specifically that it produces results slightly smaller
            // than what they should be, it is possible in certain  circumstances for "newNormalizedUnderlyingReserves
            // to be less than "normalizedUnderlyingReserves". For instance, when underlying reserves and the hToken
            // reserves have very different magnitudes.
            uint256 newNormalizedUnderlyingReserves = sum.pow(exponent.inv()).toUint();
            if (newNormalizedUnderlyingReserves < normalizedUnderlyingReserves) {
                revert YieldSpace__LossyPrecisionUnderflow(
                    newNormalizedUnderlyingReserves,
                    normalizedUnderlyingReserves
                );
            }
            normalizedUnderlyingIn = newNormalizedUnderlyingReserves - normalizedUnderlyingReserves;
        }
    }

    /// @notice Calculates the amount of underyling a user would get for a given amount of hToken.
    /// @dev Based on the equation y = (x_s^(1-gt) + y_s^(1-gt) - x^(1-gt))^(1/(1-gt)).
    /// @param hTokenReserves Amount of hToken reserves.
    /// @param normalizedUnderlyingReserves Amount of underlying reserves.
    /// @param hTokenIn Amount of hToken to be traded.
    /// @param timeToMaturity Time to maturity in seconds.
    /// @return normalizedUnderlyingOut Amount of underlying the user would get.
    function underlyingOutForHTokenIn(
        uint256 hTokenReserves,
        uint256 normalizedUnderlyingReserves,
        uint256 hTokenIn,
        uint256 timeToMaturity
    ) internal pure returns (uint256 normalizedUnderlyingOut) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G2);
        unchecked {
            uint256 newHTokenReserves = hTokenReserves + hTokenIn;
            if (newHTokenReserves < hTokenReserves) {
                revert YieldSpace__HTokenReservesOverflow(hTokenReserves, hTokenIn);
            }

            // The first two factors in the right-hand side of the equation. There is no need to guard against overflow
            // because the "pow" function yields a maximum of ~2^128 in fixed-point representation.
            uint256 startingReservesFactor = hTokenReserves.fromUint().pow(exponent) +
                normalizedUnderlyingReserves.fromUint().pow(exponent);

            // The third factor in the right-hand side of the equation.
            uint256 newHTokenReservesFactor = newHTokenReserves.fromUint().pow(exponent);
            if (startingReservesFactor < newHTokenReservesFactor) {
                revert YieldSpace__UnderlyingOutForHTokenInReservesFactorsUnderflow(
                    startingReservesFactor,
                    newHTokenReservesFactor
                );
            }

            uint256 newNormalizedUnderlyingReserves = (startingReservesFactor - newHTokenReservesFactor)
            .pow(exponent.inv())
            .toUint();
            if (normalizedUnderlyingReserves < newNormalizedUnderlyingReserves) {
                revert YieldSpace__LossyPrecisionUnderflow(
                    normalizedUnderlyingReserves,
                    newNormalizedUnderlyingReserves
                );
            }
            normalizedUnderlyingOut = normalizedUnderlyingReserves - newNormalizedUnderlyingReserves;
        }
    }
}
