/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/token/erc20/Erc20Interface.sol";
import "./FyTokenStorage.sol";

/// @title FyTokenInterface
/// @author Hifi
abstract contract FyTokenInterface is
    FyTokenStorage, /// no dependency
    Erc20Interface /// one dependency
{
    /// CONSTANT FUNCTIONS ///

    function isMatured() public view virtual returns (bool);

    /// NON-CONSTANT FUNCTIONS ///

    function borrow(uint256 borrowAmount) external virtual returns (bool);

    function burn(address holder, uint256 burnAmount) external virtual returns (bool);

    function liquidateBorrow(address borrower, uint256 repayAmount) external virtual returns (bool);

    function mint(address beneficiary, uint256 mintAmount) external virtual returns (bool);

    function repayBorrow(uint256 repayAmount) external virtual returns (bool);

    function repayBorrowBehalf(address borrower, uint256 repayAmount) external virtual returns (bool);

    function _setFintroller(FintrollerInterface newFintroller) external virtual returns (bool);

    /// EVENTS ///

    event Borrow(address indexed borrower, uint256 borrowAmount);

    event Burn(address indexed holder, uint256 burnAmount);

    event LiquidateBorrow(
        address indexed liquidator,
        address indexed borrower,
        uint256 repayAmount,
        uint256 clutchedCollateralAmount
    );

    event Mint(address indexed beneficiary, uint256 mintAmount);

    event RepayBorrow(address indexed payer, address indexed borrower, uint256 repayAmount, uint256 newDebt);

    event SetFintroller(address indexed admin, FintrollerInterface oldFintroller, FintrollerInterface newFintroller);
}
