/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "./BaseInvariants.sol";
import "../Fintroller.sol";
import "../IHToken.sol";

contract HTokenLike {
    bool public constant isHToken = true;
}

contract FintrollerInvariants is
    BaseInvariants, /// no dependency
    Fintroller /// five dependencies
{
    IHToken private hToken;

    constructor() Fintroller() {
        HTokenLike hTokenLike = new HTokenLike();
        hToken = IHToken(address(hTokenLike));
    }

    function echidna_bond_collateralization_ratio() external view returns (bool) {
        if (bonds[hToken].isListed == false) {
            return true;
        } else {
            return
                bonds[hToken].collateralizationRatio >= collateralizationRatioLowerBound &&
                bonds[hToken].collateralizationRatio <= collateralizationRatioUpperBound;
        }
    }

    function echidna_liquidation_incentive() external view returns (bool) {
        return
            bonds[hToken].liquidationIncentive >= liquidationIncentiveLowerBound &&
            bonds[hToken].liquidationIncentive <= liquidationIncentiveUpperBound;
    }
}
