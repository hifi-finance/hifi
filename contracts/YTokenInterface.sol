/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./YTokenStorage.sol";

/**
 * @title YTokenInterface
 * @author Mainframe
 */
abstract contract YTokenInterface is YTokenStorage {
    /*** View Functions ***/
    function getVault(address vaultHolder)
        external
        virtual
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function timeToLive() public virtual view returns (uint256);

    /*** Non-Constant Functions ***/
    function burn(uint256 burnAmount) external virtual returns (bool);

    function depositCollateral(uint256 collateralAmount) external virtual returns (bool);

    function freeCollateral(uint256 collateralAmount) external virtual returns (bool);

    function liquidate(address minter, uint256 repayAmount) external virtual returns (bool);

    function lockCollateral(uint256 collateralAmount) external virtual returns (bool);

    function mint(uint256 mintAmount) external virtual returns (bool);

    function settle() external virtual returns (bool);

    function withdrawCollateral(uint256 collateralAmount) external virtual returns (bool);

    /*** Events ***/
    event Burn(address indexed user, uint256 burnAmount);

    event DepositCollateral(address indexed user, uint256 collateralAmount);

    event FreeCollateral(address indexed user, uint256 collateralAmount);

    event LockCollateral(address indexed user, uint256 collateralAmount);

    event Mint(address indexed user, uint256 burnAmount);

    event WithdrawCollateral(address indexed user, uint256 collateralAmount);
}
