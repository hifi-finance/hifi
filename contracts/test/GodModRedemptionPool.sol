/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../RedemptionPool.sol";
import "../interfaces/IFyToken.sol";

/// @title GodModeRedemptionPool
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeRedemptionPool is RedemptionPool {
    constructor(IFintroller fintroller_, IFyToken fyToken_) RedemptionPool(fintroller_, fyToken_) {
        // solhint-disable-previous-line no-empty-blocks
    }

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
