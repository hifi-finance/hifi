/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./math/Exponential.sol";
import "./pricing/DumbOracleInterface.sol";

abstract contract FintrollerStorage is Exponential {
    struct Bond {
        /* The percentage that dictates the threshold under which loans become under-collateralized. */
        Exp thresholdCollateralizationRatio;
        bool isBurnAllowed;
        bool isDepositCollateralAllowed;
        bool isListed;
        bool isMintAllowed;
    }

    /**
     * @dev Official mapping of yToken -> Bond metadata
     */
    mapping(address => Bond) internal bonds;

    /**
     * @notice The threshold below which the collateralization ratio cannot be set, equivalent to 100%.
     */
    uint256 public constant collateralizationRatioLowerBoundMantissa = 1000000000000000000;

    /**
     * @notice The threshold above which the collateralization ratio cannot be set, equivalent to 10,000%.
     */
    uint256 public constant collateralizationRatioUpperBoundMantissa = 100000000000000000000;

    /**
     * @notice The dafault collateralization ratio set when a new bond is listed.
     */
    uint256 public constant defaultCollateralizationRatioMantissa = 1500000000000000000;

    /**
     * @notice Provides price information in USD for the collateral and the underlying asset.
     */
    DumbOracleInterface public oracle;
}
