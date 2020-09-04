/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenStorage.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
abstract contract YTokenInterface is YTokenStorage {
    /*** View Functions ***/
    function getVault(address user)
        external
        virtual
        view
        returns (
            uint256,
            uint256,
            uint256,
            bool
        );

    function timeToLive() public virtual view returns (uint256);

    /*** Non-Constant Functions ***/
    function borrow(uint256 borrowAmount) external virtual returns (bool);

    function depositCollateral(uint256 collateralAmount) external virtual returns (bool);

    function freeCollateral(uint256 collateralAmount) external virtual returns (bool);

    function liquidateBorrow(address borrower, uint256 repayAmount) external virtual returns (bool);

    function lockCollateral(uint256 collateralAmount) external virtual returns (bool);

    // function mint(uint256 mintAmount) external virtual returns (bool);

    // function redeem(uint256 redeemAmount) external virtual returns (bool);

    function repayBorrow(uint256 repayAmount) external virtual returns (bool);

    function repayBorrowBehalf(address borrower, uint256 repayAmount) external virtual returns (bool);

    function withdrawCollateral(uint256 collateralAmount) external virtual returns (bool);

    /*** Events ***/
    event Borrow(address indexed user, uint256 repayAmount);

    event DepositCollateral(address indexed user, uint256 collateralAmount);

    event FreeCollateral(address indexed user, uint256 collateralAmount);

    event LockCollateral(address indexed user, uint256 collateralAmount);

    event Redeem(address indexed user, uint256 settleAmount);

    event RepayBorrow(address indexed user, uint256 repayAmount);

    event RepayBorrowBehalf(address indexed payer, address indexed borrower, uint256 repayAmount);

    event SupplyRedeemableUnderlying(address indexed user, uint256 redeemableUnderlyingAmount);

    event WithdrawCollateral(address indexed user, uint256 collateralAmount);
}
