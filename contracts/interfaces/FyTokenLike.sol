// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.7.0;

/// @title FyTokenLike
/// @author Hifi
interface FyTokenLike {
    function balanceOf(address account) external view returns (uint256);

    function redemptionPool() external view returns (address);

    function liquidateBorrow(address borrower, uint256 repayAmount) external returns (bool);
}
