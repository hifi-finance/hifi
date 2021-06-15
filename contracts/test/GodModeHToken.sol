// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity >=0.8.0;

import "../core/hToken/HToken.sol";

/// @title GodModeHToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHToken is HToken {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        IBalanceSheetV1 balanceSheet_,
        IErc20 underlying_
    ) HToken(name_, symbol_, expirationTime_, balanceSheet_, underlying_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }

    function __godMode_setExpirationTime(uint256 newExpirationTime) external {
        expirationTime = newExpirationTime;
    }

    function __godMode_setTotalUnderlyingSupply(uint256 newTotalUnderlyingSupply) external {
        totalUnderlyingSupply = newTotalUnderlyingSupply;
    }

    function __godMode_setUnderlyingPrecisionScalar(uint256 newUnderlyingPrecisionScalar) external {
        underlyingPrecisionScalar = newUnderlyingPrecisionScalar;
    }
}
