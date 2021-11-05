// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/hToken/HToken.sol";

/// @title GodModeHToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeHToken is HToken {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maturity_,
        IBalanceSheetV1 balanceSheet_,
        IErc20 underlying_
    ) HToken(name_, symbol_, maturity_, balanceSheet_, underlying_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_setUnderlying(IErc20 newUnderlying) external {
        underlying = newUnderlying;
    }

    function __godMode_setMaturity(uint256 newMaturity) external {
        maturity = newMaturity;
    }
}
