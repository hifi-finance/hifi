/* SPDX-License-Identifier: LGPL-3.0-or-later */
/* solhint-disable func-name-mixedcase */
pragma solidity ^0.7.1;

import "../RedemptionPool.sol";
import "../YTokenInterface.sol";

/**
 * @title GodModeRedemptionPool
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeRedemptionPool is RedemptionPool {
    /* solhint-disable-next-line no-empty-blocks */
    constructor(FintrollerInterface fintroller_, YTokenInterface yToken_) RedemptionPool(fintroller_, yToken_) {}

    function __godMode_burnYTokens(uint256 yTokenAmount) external {
        yToken.burn(msg.sender, yTokenAmount);
    }

    function __godMode_mintYTokens(uint256 yTokenAmount) external {
        yToken.mint(msg.sender, yTokenAmount);
    }

    function __godMode_setTotalUnderlyingSupply(uint256 newTotalUnderlyingSupply) external {
        totalUnderlyingSupply = newTotalUnderlyingSupply;
    }
}
