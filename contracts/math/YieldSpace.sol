// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

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
    /// @param normalizedUnderlyingReserves Normalized amount of underlying reserves, as a basic integer.
    /// @param fyTokenReserves Amount of fyToken reserves, as a basic integer.
    /// @param normalizedUnderlyingOut Amount of underlying to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return fyTokenIn Amount of fyToken a user could sell, as a basic integer.
    function fyTokenInForUnderlyingOut(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingOut,
        uint256 timeToMaturity
    ) internal pure returns (uint256 fyTokenIn) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G2);
        unchecked {
            require(normalizedUnderlyingOut <= normalizedUnderlyingReserves, "YieldSpace: too much underlying out");
            uint256 newUnderlyingReserves = normalizedUnderlyingReserves - normalizedUnderlyingOut;

            // TODO: can this overflow?
            uint256 sum =
                normalizedUnderlyingReserves.fromUint().pow(exponent) +
                    fyTokenReserves.fromUint().pow(exponent) -
                    newUnderlyingReserves.fromUint().pow(exponent);
            fyTokenIn = sum.pow(exponent.inv()).toUint() - fyTokenReserves;
        }
    }

    /// @notice Calculates the amount of fyToken a user would get for a given amount of underlying.
    /// @param normalizedUnderlyingReserves underlying reserves amount, as a basic integer.
    /// @param fyTokenReserves fyToken reserves amount, as a basic integer.
    /// @param normalizedUnderlyingIn Amount of underlying to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return fyTokenOut Amount of fyToken the user would get, as a basic integer.
    function fyTokenOutForUnderlyingIn(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 normalizedUnderlyingIn,
        uint256 timeToMaturity
    ) internal pure returns (uint256 fyTokenOut) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G1);
        unchecked {
            uint256 newUnderlyingReserves = normalizedUnderlyingReserves + normalizedUnderlyingIn;
            require(newUnderlyingReserves >= normalizedUnderlyingReserves, "YieldSpace: too much underlying in");

            // TODO: can this overflow?
            uint256 sum =
                normalizedUnderlyingReserves.fromUint().pow(exponent) +
                    fyTokenReserves.fromUint().pow(exponent) -
                    newUnderlyingReserves.fromUint().pow(exponent);
            fyTokenOut = fyTokenReserves - sum.pow(exponent.inv()).toUint();
        }
    }

    /// @notice Computes the yield exponent 1 - g*t, as per the whitepaper.
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
    /// @param normalizedUnderlyingReserves Amount of underlying reserves, as a basic integer.
    /// @param fyTokenReserves Amount of fyToken reserves, as a basic integer.
    /// @param fyTokenOut Amount of underlying to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return normalizedUnderlyingIn Amount of fyToken a user could sell, as a basic integer.
    function underlyingInForFyTokenOut(
        uint256 normalizedUnderlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenOut,
        uint256 timeToMaturity
    ) internal pure returns (uint256 normalizedUnderlyingIn) {
        uint256 exponent = getYieldExponent(timeToMaturity.fromUint(), G1);
        unchecked {
            require(fyTokenOut <= fyTokenReserves, "YieldSpace: too much fyToken out");
            uint256 newFyTokenReserves = fyTokenReserves - fyTokenOut;

            // TODO: can this overflow?
            uint256 sum =
                normalizedUnderlyingReserves.fromUint().pow(exponent) +
                    fyTokenReserves.fromUint().pow(exponent) -
                    newFyTokenReserves.fromUint().pow(exponent);
            normalizedUnderlyingIn = sum.pow(exponent.inv()).toUint() - normalizedUnderlyingReserves;
        }
    }

    /// @notice Calculates the amount of underyling a user would get for a given amount of fyToken.
    /// @param normalizedUnderlyingReserves Amount of underlying reserves, as a basic integer.
    /// @param fyTokenReserves Amount of fyToken reserves, as a basic integer.
    /// @param fyTokenIn Amount of fyToken to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return normalizedUnderlyingOut Amount of underlying the user would get, as a basic integer.
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

            // TODO: can this overflow?
            uint256 sum =
                normalizedUnderlyingReserves.fromUint().pow(exponent) +
                    fyTokenReserves.fromUint().pow(exponent) -
                    newFyTokenReserves.fromUint().pow(exponent);
            normalizedUnderlyingOut = normalizedUnderlyingReserves - sum.pow(exponent.inv()).toUint();
        }
    }
}
