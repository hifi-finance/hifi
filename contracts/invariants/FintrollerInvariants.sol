/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./BaseInvariants.sol";
import "../Fintroller.sol";
import "../IFyToken.sol";

contract FyTokenLike {
    bool public constant isFyToken = true;
}

contract FintrollerInvariants is
    BaseInvariants, /// no dependency
    Fintroller /// five dependencies
{
    IFyToken private fyToken;

    constructor() Fintroller() {
        FyTokenLike fyTokenLike = new FyTokenLike();
        fyToken = IFyToken(address(fyTokenLike));
    }

    function echidna_bond_collateralization_ratio() external view returns (bool) {
        if (bonds[fyToken].isListed == false) {
            return true;
        } else {
            return
                bonds[fyToken].collateralizationRatio >= collateralizationRatioLowerBound &&
                bonds[fyToken].collateralizationRatio <= collateralizationRatioUpperBound;
        }
    }

    function echidna_liquidation_incentive() external view returns (bool) {
        return
            bonds[fyToken].liquidationIncentive >= liquidationIncentiveLowerBound &&
            bonds[fyToken].liquidationIncentive <= liquidationIncentiveUpperBound;
    }
}
