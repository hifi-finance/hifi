/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

/**
 * @title yTokenInterface
 * @author Mainframe
 */
abstract contract yTokenInterface {
    function mint(uint256 underlyingMintAmount) external virtual returns (bool);

    function redeem(uint256 redeemAmount) external virtual returns (bool);

    function redeemUnderlying(uint256 underlyingRedeemAmount) external virtual returns (bool);

    function settle() external virtual returns (bool);

    /*** Admin Functions ***/

    function _reduceReserves(uint256 reduceAmount) external virtual returns (bool);

    function _setReserveFactor(uint256 newReserveFactorMantissa) external virtual returns (bool);
}
