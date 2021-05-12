/// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity ^0.8.0;

import "../FyToken.sol";

/// @title GodModeFyToken
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeFyToken is FyToken {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        IFintroller fintroller_,
        IBalanceSheet balanceSheet_,
        IErc20 underlying_,
        IErc20 collateral_
    ) FyToken(name_, symbol_, expirationTime_, fintroller_, balanceSheet_, underlying_, collateral_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }

    function __godMode__setRedemptionPool(IRedemptionPool redemptionPool_) external {
        redemptionPool = redemptionPool_;
    }
}
