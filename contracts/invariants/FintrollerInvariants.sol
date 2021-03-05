/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./BaseInvariants.sol";
import "../Fintroller.sol";
import "../FyTokenInterface.sol";

contract FyTokenLike {
    bool public constant isFyToken = true;
}

contract FintrollerInvariants is
    BaseInvariants, /// no dependency
    Fintroller /// five dependencies
{
    FyTokenInterface private fyToken;

    constructor() Fintroller() {
        FyTokenLike fyTokenLike = new FyTokenLike();
        fyToken = FyTokenInterface(address(fyTokenLike));
    }

    function echidna_bond_collateralization_ratio() external view returns (bool) {
        if (bonds[fyToken].isListed == false) {
            return true;
        } else {
            return
                bonds[fyToken].collateralizationRatio.mantissa >= collateralizationRatioLowerBoundMantissa &&
                bonds[fyToken].collateralizationRatio.mantissa <= collateralizationRatioUpperBoundMantissa;
        }
    }

    function echidna_liquidation_incentive() external view returns (bool) {
        return
            liquidationIncentiveMantissa >= liquidationIncentiveLowerBoundMantissa &&
            liquidationIncentiveMantissa <= liquidationIncentiveUpperBoundMantissa;
    }
}
