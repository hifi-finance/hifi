/* SPDX-License-Identifier: LGPL-3.0-or-later */
/* solhint-disable func-name-mixedcase, no-empty-blocks */
pragma solidity ^0.7.1;

import "../YToken.sol";

/**
 * @title GodModeYToken
 * @author Mainframe
 * @dev Strictly for test purposes. Do not use in production.
 */
contract GodModeYToken is YToken {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 expirationTime_,
        FintrollerInterface fintroller_,
        BalanceSheetInterface balanceSheet_,
        Erc20Interface underlying_,
        Erc20Interface collateral_
    ) YToken(name_, symbol_, expirationTime_, fintroller_, balanceSheet_, underlying_, collateral_) {}

    function __godMode_mint(address beneficiary, uint256 mintAmount) external {
        mintInternal(beneficiary, mintAmount);
    }

    function __godMode__setRedemptionPool(RedemptionPoolInterface redemptionPool_) external {
        redemptionPool = redemptionPool_;
    }
}
