/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.8.0;

import "../RedemptionPool.sol";
import "../FyTokenInterface.sol";

/**
 * @title GodModeRedemptionPool
 * @author Hifi
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeRedemptionPool is RedemptionPool {
    /* solhint-disable-next-line no-empty-blocks */
    constructor(FintrollerInterface fintroller_, FyTokenInterface fyToken_) RedemptionPool(fintroller_, fyToken_) {}

    function __godMode_burnYTokens(uint256 fyTokenAmount) external {
        fyToken.burn(msg.sender, fyTokenAmount);
    }

    function __godMode_mintYTokens(uint256 fyTokenAmount) external {
        fyToken.mint(msg.sender, fyTokenAmount);
    }

    function __godMode_setTotalUnderlyingSupply(uint256 newTotalUnderlyingSupply) external {
        totalUnderlyingSupply = newTotalUnderlyingSupply;
    }
}
