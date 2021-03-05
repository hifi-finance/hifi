/// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase, no-empty-blocks
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
        FintrollerInterface fintroller_,
        BalanceSheetInterface balanceSheet_,
        Erc20Interface underlying_,
        Erc20Interface collateral_
    ) FyToken(name_, symbol_, expirationTime_, fintroller_, balanceSheet_, underlying_, collateral_) {}

    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }

    function __godMode__setRedemptionPool(RedemptionPoolInterface redemptionPool_) external {
        redemptionPool = redemptionPool_;
    }
}
