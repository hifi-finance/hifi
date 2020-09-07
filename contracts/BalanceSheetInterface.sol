/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.6.10;

import "./BalanceSheetStorage.sol";
import "./YTokenInterface.sol";

/**
 * @title BalanceSheetInterface
 * @author Mainframe
 */
abstract contract BalanceSheetInterface is BalanceSheetStorage {
    /*** View Functions ***/
    function getVault(YTokenInterface yToken, address user)
        external
        virtual
        view
        returns (
            uint256,
            uint256,
            uint256,
            bool
        );

    function isVaultOpen(YTokenInterface yToken, address user) external virtual returns (bool);

    /*** Non-Constant Functions ***/
    function depositCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function freeCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function openVault(YTokenInterface yToken) external virtual returns (bool);

    function lockCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function setVaultDebt(
        YTokenInterface yToken,
        address user,
        uint256 newDebt
    ) external virtual returns (bool);

    function withdrawCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    /*** Events ***/
    event DepositCollateral(YTokenInterface indexed yToken, address indexed user, uint256 collateralAmount);

    event FreeCollateral(YTokenInterface indexed yToken, address indexed user, uint256 collateralAmount);

    event OpenVault(YTokenInterface indexed yToken, address indexed user);

    event LockCollateral(YTokenInterface indexed yToken, address indexed user, uint256 collateralAmount);

    event SetVaultDebt(YTokenInterface indexed yToken, address indexed user, uint256 oldDebt, uint256 newDebt);

    event WithdrawCollateral(YTokenInterface indexed yToken, address indexed user, uint256 collateralAmount);
}
