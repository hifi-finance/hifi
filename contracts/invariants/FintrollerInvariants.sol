/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "./BaseInvariants.sol";
import "../FintrollerV1.sol";

contract CollateralLike {
    uint256 public constant totalSupply = 100e18;
}

contract FintrollerInvariants is
    BaseInvariants, // no dependency
    FintrollerV1 // four dependencies
{
    IErc20 private collateral;

    constructor() FintrollerV1() {
        CollateralLike collateralLike = new CollateralLike();
        collateral = IErc20(address(collateralLike));
    }

    function echidna_collateralization_ratio() external view returns (bool) {
        if (collaterals[collateral].isListed == false) {
            return true;
        } else {
            return
                collaterals[collateral].collateralizationRatio >= COLLATERALIZATION_RATIO_LOWER_BOUND &&
                collaterals[collateral].collateralizationRatio <= COLLATERALIZATION_RATIO_UPPER_BOUND;
        }
    }

    function echidna_liquidation_incentive() external view returns (bool) {
        return
            collaterals[collateral].liquidationIncentive >= LIQUIDATION_INCENTIVE_LOWER_BOUND &&
            collaterals[collateral].liquidationIncentive <= LIQUIDATION_INCENTIVE_UPPER_BOUND;
    }
}
