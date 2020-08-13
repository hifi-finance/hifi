/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenStorage.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
abstract contract YTokenInterface is YTokenStorage {
    /*** View Functions ***/
    function getVault(address vaultHolder) external virtual view returns (uint256, uint256);

    /*** Non-Constant Functions ***/
    function burn(uint256 burnAmount) external virtual returns (bool);

    function burnBehalf(address minter, uint256 repayAmount) external virtual returns (bool);

    function depositCollateral(uint256 collateralAmount) public virtual returns (bool);

    function freeCollateral(uint256 collateralAmount) external virtual returns (bool);

    function liquidate(address minter, uint256 repayAmount) external virtual returns (bool);

    function lockCollateral(uint256 collateralAmount) external virtual returns (bool);

    function mint(uint256 yTokenAmount) external virtual returns (bool);

    function settle() external virtual returns (bool);

    /*** Admin Functions ***/
    function _reduceReserves(uint256 reduceAmount) external virtual returns (bool);

    function _setReserveFactor(uint256 newReserveFactorMantissa) external virtual returns (bool);

    /*** Events ***/
    event DepositCollateral(address indexed user, uint256 collateralAmount);

    event FreeCollateral(address indexed user, uint256 collateralAmount);

    event LockCollateral(address indexed user, uint256 collateralAmount);

    event Mint(address indexed user, uint256 yTokenAmount);
}
