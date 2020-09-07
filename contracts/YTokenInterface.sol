/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenStorage.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
abstract contract YTokenInterface is YTokenStorage {
    /*** View Functions ***/
    function timeToLive() public virtual view returns (uint256);

    /*** Non-Constant Functions ***/
    function borrow(uint256 borrowAmount) external virtual returns (bool);

    function liquidateBorrow(address borrower, uint256 repayAmount) external virtual returns (bool);

    function mint(address beneficiary, uint256 borrowAmount) external virtual returns (bool);

    function repayBorrow(uint256 repayAmount) external virtual returns (bool);

    function repayBorrowBehalf(address borrower, uint256 repayAmount) external virtual returns (bool);

    /*** Events ***/
    event Borrow(address indexed user, uint256 repayAmount);

    event Mint(address indexed user, uint256 mintAmount);

    event Redeem(address indexed user, uint256 settleAmount);

    event RepayBorrow(address indexed payer, address indexed borrower, uint256 repayAmount);
}
