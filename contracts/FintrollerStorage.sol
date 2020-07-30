/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./math/Exponential.sol";

abstract contract FintrollerStorage is Exponential {
    /**
     * @notice The threshold below which the collateralization ratio cannot be set, equivalent to 100%.
     */
    uint256 public constant COLLATERALIZATION_RATIO_LOWER_BOUND_MANTISSA = 1000000000000000000;

    /**
     * @notice The threshold above which the collateralization ratio cannot be set, equivalent to 10,000%.
     */
    uint256 public constant COLLATERALIZATION_RATIO_UPPER_BOUND_MANTISSA = 100000000000000000000;

    /**
     * @notice The percentage that dictates the threshold under which loans become under-collateralized.
     */
    Exp public collateralizationRatio;

    /**
     * @notice Provides price information in USD for the collateral and the underlying asset.
     */
    address public oracle;
}
