/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./math/Exponential.sol";
import "./oracles/UniswapAnchoredViewInterface.sol";

abstract contract FintrollerStorage is Exponential {
    struct Bond {
        Exp collateralizationRatio;
        uint256 debtCeiling;
        bool isBorrowAllowed;
        bool isDepositCollateralAllowed;
        bool isListed;
        bool isRedeemUnderlyingAllowed;
        bool isRepayBorrowAllowed;
        bool isSupplyUnderlyingAllowed;
    }

    /**
     * @dev Maps the yToken address to the Bond structs.
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
     * @notice The contract that provides price data for the collateral and the underlying asset.
     */
    UniswapAnchoredViewInterface public oracle;

    /**
     * @notice Multiplier representing the discount on collateral that a liquidator receives.
     */
    uint256 public liquidationIncentiveMantissa = 1100000000000000000;

    /**
     * @notice The ratio between mantissa precision (1e18) and the oracle price precision (1e6).
     */
    uint256 public constant oraclePricePrecisionScalar = 1e12;

    /**
     * @notice Indicator that this is a Fintroller contract, for inspection.
     */
    bool public constant isFintroller = true;
}
