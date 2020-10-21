/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "../Fintroller.sol";

/**
 * @title FintrollerInvariants
 * @author Mainframe
 */
contract FintrollerInvariants is Fintroller {
    constructor() {}

    function echidna_liquidation_incentive() external view returns (bool) {
        return
            liquidationIncentiveMantissa >= liquidationIncentiveLowerBoundMantissa &&
            liquidationIncentiveMantissa <= liquidationIncentiveUpperBoundMantissa;
    }
}
