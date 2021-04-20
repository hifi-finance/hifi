// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

/// @title YieldSpace
/// @author Hifi
library YieldSpace {
    /// @notice 1 as a mantissa followed by 18 decimals.
    uint256 public constant ONE = 1.0e18;

    /// @notice 1 divided by the number seconds in 4 years.
    uint256 public constant k = ONE / 126144000;

    /// CONSTANT FUNCTIONS ///

    function getExponent(uint256 g, uint256 timeToMaturity) public pure returns (uint256) {
        // t = k * timeToMaturity
        uint256 t = k * timeToMaturity;

        // a = 1 - g * t
        uint256 product = g * t;
        require(ONE > product, "ERR_YIELD_SPACE_TOO_FAR_FROM_MATURITY");
        uint256 a = ONE - product;

        return a;
    }

    /// NON-CONSTANT FUNCTIONS ///
    function fyTokenOutForUnderlyingIn(
        uint256 underlyingReserves,
        uint256 fyTokenReserves,
        uint256 underlyingAmount,
        uint256 timeToMaturity,
        uint256 g
    ) internal pure returns (uint256) {
        uint256 a = getExponent(g, timeToMaturity);

        // newUnderlyingReserves = underlyingReserves + underlyingAmount
        uint256 newUnderlyingReserves = underlyingReserves + underlyingAmount;
        uint256 sum = underlyingReserves**a + fyTokenReserves**a - newUnderlyingReserves**a;
        uint256 result = fyTokenReserves - sum**(ONE - a);

        // result = result > 1e12 ? result - 1e12 : 0; // Substract error guard, flooring the result at zero

        return result;
    }
}
