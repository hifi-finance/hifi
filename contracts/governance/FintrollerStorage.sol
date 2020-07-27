/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "../math/Exponential.sol";

abstract contract FintrollerStorage is Exponential {
    /**
     * @notice The percentage that dictates the threshold under which loans become under-collateralized.
     */
    Exp public collateralizationRatio;

    /**
     * @notice Provides price information in USD for the collateral and the underlying asset.
     */
    address public oracle;
}
