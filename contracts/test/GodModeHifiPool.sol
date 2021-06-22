// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "../HifiPool.sol";

/// @title GodModeHifiPool
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHifiPool is HifiPool {
    constructor(
        string memory name_,
        string memory symbol_,
        HTokenLike hToken_,
        IErc20 underlying_
    ) HifiPool(name_, symbol_, hToken_, underlying_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_mint(uint256 mintAmount) external {
        mintInternal(msg.sender, mintAmount);
    }

    function __godMode_setUnderlyingPrecisionScalar(uint256 underlyingPrecisionScalar_) external {
        underlyingPrecisionScalar = underlyingPrecisionScalar_;
    }

    function __godMode_setTotalSupply(uint256 totalSupply_) external {
        totalSupply = totalSupply_;
    }
}
