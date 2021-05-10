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
    uint256 internal constant CUTOFF_TIME_TO_MATURITY = 119836799 * SCALE;

    /// @notice 1 divided by the number of seconds in four years, as an unsigned 60.18-decimal fixed-point number.
    /// Computed with 1e18 / 126144000.
    uint256 internal constant K = 7927447996;

    /// @notice Fee coefficient used when selling underlying to the pool, as an unsigned 60.18-decimal fixed-point
    /// number. Computed with (950 * 1e18) / 1000.
    uint256 internal constant G1 = 9.5e17;

    /// @notice Fee coefficient used when selling fyToken to the pool, as an unsigned 60.18-decimal fixed-point number.
    /// Computed with (1000 * 1e18) / 950.
    uint256 internal constant G2 = 1052631578947368421;

    /// @notice Number of seconds in four years, assuming calendar common years, as an unsigned 60.18-decimal
    /// fixed-point number.
    uint256 internal constant SECONDS_FOUR_YEARS = 126144000 * SCALE;

    /// @notice Number of decimals used in the SD59x18 format.
    uint256 internal constant SCALE = 1e18;

    /// @notice Calculates the amount of fyToken a user could sell for a given amount of underlying.
    /// @param underlyingReserves Amount of underlying reserves, as a basic integer.
    /// @param fyTokenReserves Amount of fyToken reserves, as a basic integer.
    /// @param underlyingAmount Amount of underlying to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return fyTokenAmount Amount of fyToken a user could sell, as a basic integer.
    function fyTokenInForUnderlyingOut(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 underlyingAmount,
        uint256 timeToMaturity
    ) internal pure returns (uint256 fyTokenAmount) {
        uint256 a = getA(timeToMaturity.fromUint(), G2);
        unchecked {
            require(underlyingAmount <= underlyingReserves, "YieldSpace: too much underlying out");
            uint256 newUnderlyingReserves = underlyingReserves - underlyingAmount;

            // TODO: can this overflow?
            uint256 sum =
                underlyingReserves.fromUint().pow(a) +
                    fyTokenReserves.fromUint().pow(a) -
                    newUnderlyingReserves.fromUint().pow(a);
            fyTokenAmount = sum.pow(a.inv()).toUint() - fyTokenReserves;

            // TODO: wut the heck is this? The fee charged by the AMM?
            fyTokenAmount = fyTokenAmount < PRBMathUD60x18.MAX_UD60x18 - 1e12
                ? fyTokenAmount + 1e12
                : PRBMathUD60x18.MAX_UD60x18;
        }
    }

    /// @notice Calculates the amount of fyToken a user would get for a given amount of underlying.
    /// @param underlyingReserves underlying reserves amount, as a basic integer.
    /// @param fyTokenReserves fyToken reserves amount, as a basic integer.
    /// @param underlyingAmount Amount of underlying to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return fyTokenAmount Amount of fyToken the user would get, as a basic integer.
    function fyTokenOutForUnderlyingIn(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 underlyingAmount,
        uint256 timeToMaturity
    ) internal pure returns (uint256 fyTokenAmount) {
        uint256 a = getA(timeToMaturity.fromUint(), G1);
        unchecked {
            uint256 newUnderlyingReserves = underlyingReserves + underlyingAmount;
            require(newUnderlyingReserves >= underlyingReserves, "YieldSpace: too much underlying in");

            // TODO: can this overflow?
            uint256 sum =
                underlyingReserves.fromUint().pow(a) +
                    fyTokenReserves.fromUint().pow(a) -
                    newUnderlyingReserves.fromUint().pow(a);
            fyTokenAmount = fyTokenReserves - sum.pow(a.inv()).toUint();

            // TODO: wut the heck is this? The fee charged by the AMM?
            fyTokenAmount = fyTokenAmount > 1e12 ? fyTokenAmount - 1e12 : uint256(0);
        }
    }

    /// @notice Computes the "a" exponent 1 - g*t, as per the whitepaper.
    /// @param timeToMaturity Time to maturity in seconds, as an unsigned 60.18-decimal fixed-point number.
    /// @param g The fee coefficient as an unsigned 60.18-decimal fixed-point number.
    /// @return a The exponent, as per the whitepaper, as an unsigned 60.18-decimal fixed-point number.
    function getA(uint256 timeToMaturity, uint256 g) internal pure returns (uint256 a) {
        require(timeToMaturity <= CUTOFF_TIME_TO_MATURITY, "YieldSpace: too far from maturity");
        unchecked {
            uint256 t = K.mul(timeToMaturity);

            // This cannot get lower than zero due to the require statement above.
            a = SCALE - g.mul(t);
        }
    }

    /// @notice Calculates the amount of underlying a user could sell for a given amount of fyToken.
    /// @param underlyingReserves Amount of underlying reserves, as a basic integer.
    /// @param fyTokenReserves Amount of fyToken reserves, as a basic integer.
    /// @param fyTokenAmount Amount of underlying to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return underlyingAmount Amount of fyToken a user could sell, as a basic integer.
    function underlyingInForFyTokenOut(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenAmount,
        uint256 timeToMaturity
    ) internal pure returns (uint256 underlyingAmount) {
        uint256 a = getA(timeToMaturity.fromUint(), G1);
        unchecked {
            require(fyTokenAmount <= fyTokenReserves, "YieldSpace: too much fyToken out");
            uint256 newFyTokenReserves = fyTokenReserves - fyTokenAmount;

            // TODO: can this overflow?
            uint256 sum =
                underlyingReserves.fromUint().pow(a) +
                    fyTokenReserves.fromUint().pow(a) -
                    newFyTokenReserves.fromUint().pow(a);
            underlyingAmount = sum.pow(a.inv()).toUint() - underlyingReserves;

            // TODO: wut the heck is this? The fee charged by the AMM?
            underlyingAmount = underlyingAmount < PRBMathUD60x18.MAX_UD60x18 - 1e12
                ? underlyingAmount + 1e12
                : PRBMathUD60x18.MAX_UD60x18;
        }
    }

    /// @notice Calculates the amount of underyling a user would get for a given amount of fyToken.
    /// @param underlyingReserves Amount of underlying reserves, as a basic integer.
    /// @param fyTokenReserves Amount of fyToken reserves, as a basic integer.
    /// @param fyTokenAmount Amount of fyToken to be traded, as a basic integer.
    /// @param timeToMaturity Time to maturity in seconds, as a basic integer.
    /// @return underlyingAmount Amount of underlying the user would get, as a basic integer.
    function underlyingOutForFyTokenIn(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 fyTokenAmount,
        uint256 timeToMaturity
    ) internal pure returns (uint256 underlyingAmount) {
        uint256 a = getA(timeToMaturity.fromUint(), G2);
        unchecked {
            uint256 newFyTokenReserves = fyTokenReserves + fyTokenAmount;
            require(newFyTokenReserves >= fyTokenReserves, "YieldSpace: too much fyToken in");

            // TODO: can this overflow?
            uint256 sum =
                underlyingReserves.fromUint().pow(a) +
                    fyTokenReserves.fromUint().pow(a) -
                    newFyTokenReserves.fromUint().pow(a);
            underlyingAmount = underlyingReserves - sum.pow(a.inv()).toUint();

            // TODO: wut the heck is this? The fee charged by the AMM?
            underlyingAmount = underlyingAmount > 1e12 ? underlyingAmount - 1e12 : uint256(0);
        }
    }
}
