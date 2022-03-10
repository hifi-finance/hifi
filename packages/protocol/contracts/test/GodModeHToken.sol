// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity >=0.8.4;

import "../core/h-token/HToken.sol";

/// @title GodModeHToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHToken is HToken {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maturity_,
        IBalanceSheetV2 balanceSheet_,
        IFintroller fintroller_,
        IErc20 underlying_
    ) HToken(name_, symbol_, maturity_, balanceSheet_, fintroller_, underlying_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }

    function __godMode_setMaturity(uint256 newMaturity) external {
        maturity = newMaturity;
    }

    function __godMode_setTotalUnderlyingReserve(uint256 newTotalUnderlyingReserve) external {
        totalUnderlyingReserve = newTotalUnderlyingReserve;
    }

    function __godMode_setUnderlyingPrecisionScalar(uint256 newUnderlyingPrecisionScalar) external {
        underlyingPrecisionScalar = newUnderlyingPrecisionScalar;
    }
}
