/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenStorage.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
abstract contract YTokenInterface is YTokenStorage {
    /**
     * VIEW FUNCTIONS
     */
    function timeToLive() public virtual view returns (uint256);

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function borrow(uint256 borrowAmount) external virtual returns (bool);

    function burn(address holder, uint256 burnAmount) external virtual returns (bool);

    function liquidateBorrow(address borrower, uint256 repayAmount) external virtual returns (bool);

    function mint(address beneficiary, uint256 borrowAmount) external virtual returns (bool);

    function repayBorrow(uint256 repayAmount) external virtual returns (bool);

    function repayBorrowBehalf(address borrower, uint256 repayAmount) external virtual returns (bool);

    /**
     * EVENTS
     */
    event Borrow(address indexed user, uint256 repayAmount);

    event Burn(address indexed user, uint256 burnAmount);

    event Mint(address indexed user, uint256 mintAmount);

    event RepayBorrow(address indexed payer, address indexed borrower, uint256 repayAmount);
}
