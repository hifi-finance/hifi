/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenStorage.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
abstract contract YTokenInterface is YTokenStorage {

    /*** Non-Constant Functions ***/
    function borrow(uint256 borrowUnderlyingAmount) external virtual returns (bool);

    function liquidateBorrow(address borrower, uint256 repayUnderlyingAmount) external virtual returns (bool);

    function mint(uint256 YTokenAmount) external virtual returns (bool);

    function redeem(uint256 redeemUnderlyingAmount) external virtual returns (bool);

    function repayBorrow(uint256 repayUnderlyingAmount) external virtual returns (bool);

    function repayBorrowBehalf(address borrower, uint256 repayUnderlyingAmount) external virtual returns (bool);

    function settle() external virtual returns (bool);

    /*** Admin Functions ***/

    function _reduceReserves(uint256 reduceAmount) external virtual returns (bool);

    function _setReserveFactor(uint256 newReserveFactorMantissa) external virtual returns (bool);
}
