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
    function burn(uint256 burnAmount) external virtual returns (bool);

    function burnBehalf(address borrower, uint256 burnAmount) external virtual returns (bool);

    function depositCollateral(uint256 collateralAmount) external virtual returns (bool);

    function freeCollateral(uint256 collateralAmount) external virtual returns (bool);

    function liquidate(address minter, uint256 repayAmount) external virtual returns (bool);

    function lockCollateral(uint256 collateralAmount) external virtual returns (bool);

    function mint(uint256 mintAmount) external virtual returns (bool);

    function redeem(uint256 redeemAmount) external virtual returns (bool);

    function supplyRedeemableUnderlyingAndMint(uint256 redeemableUnderlyingAmount) external virtual returns (bool);

    function withdrawCollateral(uint256 collateralAmount) external virtual returns (bool);

    /*** Events ***/
    event Burn(address indexed user, uint256 burnAmount);

    event BurnBehalf(address indexed payer, address indexed borrower, uint256 burnAmount);

    event DepositCollateral(address indexed user, uint256 collateralAmount);

    event FreeCollateral(address indexed user, uint256 collateralAmount);

    event LockCollateral(address indexed user, uint256 collateralAmount);

    event Mint(address indexed user, uint256 burnAmount);

    event Redeem(address indexed user, uint256 settleAmount);

    event SupplyRedeemableUnderlying(address indexed user, uint256 redeemableUnderlyingAmount);

    event WithdrawCollateral(address indexed user, uint256 collateralAmount);
}
