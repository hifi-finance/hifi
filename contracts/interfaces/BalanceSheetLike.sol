/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

/// @title BalanceSheetLike
/// @author Hifi
interface BalanceSheetLike {
    function isAccountUnderwater(address fyToken, address borrower) external view returns (bool);
}
