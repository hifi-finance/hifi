/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "./BaseInvariants.sol";
import "../Fintroller.sol";
import "../YTokenInterface.sol";

contract YTokenLike {
    bool public constant isYToken = true;
}

contract FintrollerInvariants is
    BaseInvariants, /* no dependency */
    Fintroller /* eleven dependencies */
{
    YTokenInterface private yToken;

    constructor() Fintroller() {
        YTokenLike yTokenLike = new YTokenLike();
        yToken = YTokenInterface(address(yTokenLike));
    }

    function echidna_bond_collateralization_ratio() external view returns (bool) {
        if (bonds[yToken].isListed == false) {
            return true;
        } else {
            return
                bonds[yToken].collateralizationRatio.mantissa >= collateralizationRatioLowerBoundMantissa &&
                bonds[yToken].collateralizationRatio.mantissa <= collateralizationRatioUpperBoundMantissa;
        }
    }

    function echidna_liquidation_incentive() external view returns (bool) {
        return
            liquidationIncentiveMantissa >= liquidationIncentiveLowerBoundMantissa &&
            liquidationIncentiveMantissa <= liquidationIncentiveUpperBoundMantissa;
    }
}
