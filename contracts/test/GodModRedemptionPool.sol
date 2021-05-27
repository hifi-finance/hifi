/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../RedemptionPool.sol";
import "../IHToken.sol";

/// @title GodModeRedemptionPool
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeRedemptionPool is RedemptionPool {
    constructor(IFintroller fintroller_, IHToken hToken_) RedemptionPool(fintroller_, hToken_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_burnHTokens(uint256 hTokenAmount) external {
        hToken.burn(msg.sender, hTokenAmount);
    }

    function __godMode_mintHTokens(uint256 hTokenAmount) external {
        hToken.mint(msg.sender, hTokenAmount);
    }

    function __godMode_setTotalUnderlyingSupply(uint256 newTotalUnderlyingSupply) external {
        totalUnderlyingSupply = newTotalUnderlyingSupply;
    }
}
