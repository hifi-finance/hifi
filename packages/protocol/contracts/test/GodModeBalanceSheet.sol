// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "../core/balance-sheet/BalanceSheetV2.sol";
import "../core/h-token/IHToken.sol";

/// @title GodModeBalanceSheet
/// @author Hifi
/// @dev Strictly for test purposes. Do not use in production.
contract GodModeBalanceSheet is BalanceSheetV2 {
    function __godMode_setBondList(address account, IHToken[] memory bondList) external {
        vaults[account].bondList = bondList;
    }

    function __godMode_setCollateralAmount(
        address account,
        IErc20 collateral,
        uint256 newCollateralAmount
    ) external {
        vaults[account].collateralAmounts[collateral] = newCollateralAmount;
    }

    function __godMode_setCollateralList(address account, IErc20[] memory collateralList) external {
        vaults[account].collateralList = collateralList;
    }

    function __godMode_setDebtAmount(
        address account,
        IHToken bond,
        uint256 newDebtAmount
    ) external {
        vaults[account].debtAmounts[bond] = newDebtAmount;
    }
}
