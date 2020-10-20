/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.0;

import "@paulrberg/contracts/math/Exponential.sol";
import "./BalanceSheetStorage.sol";

/**
 * @title BalanceSheetInterface
 * @author Mainframe
 */
abstract contract BalanceSheetInterface is
    BalanceSheetStorage, /* no dependency */
    Exponential /* two dependencies */
{
    /**
     * CONSTANT FUNCTIONS
     */
    function getClutchableCollateral(YTokenInterface yToken, uint256 repayAmount)
        external
        view
        virtual
        returns (uint256);

    function getCurrentCollateralizationRatio(YTokenInterface yToken, address account)
        public
        view
        virtual
        returns (uint256);

    function getHypotheticalCollateralizationRatio(
        YTokenInterface yToken,
        address account,
        uint256 lockedCollateral,
        uint256 debt
    ) public view virtual returns (uint256);

    function getVault(YTokenInterface yToken, address account)
        external
        view
        virtual
        returns (
            uint256,
            uint256,
            uint256,
            bool
        );

    function getVaultDebt(YTokenInterface yToken, address account) external view virtual returns (uint256);

    function getVaultLockedCollateral(YTokenInterface yToken, address account) external view virtual returns (uint256);

    function isAccountUnderwater(YTokenInterface yToken, address account) external view virtual returns (bool);

    function isVaultOpen(YTokenInterface yToken, address account) external view virtual returns (bool);

    /**
     * NON-CONSTANT FUNCTIONS
     */

    function clutchCollateral(
        YTokenInterface yToken,
        address liquidator,
        address borrower,
        uint256 clutchedCollateralAmount
    ) external virtual returns (bool);

    function depositCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function freeCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function lockCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function openVault(YTokenInterface yToken) external virtual returns (bool);

    function setVaultDebt(
        YTokenInterface yToken,
        address account,
        uint256 newVaultDebt
    ) external virtual returns (bool);

    function withdrawCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    /**
     * EVENTS
     */

    event ClutchCollateral(
        YTokenInterface indexed yToken,
        address indexed liquidator,
        address indexed borrower,
        uint256 clutchedCollateralAmount
    );

    event DepositCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);

    event FreeCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);

    event LockCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);

    event OpenVault(YTokenInterface indexed yToken, address indexed account);

    event SetVaultDebt(YTokenInterface indexed yToken, address indexed account, uint256 oldDebt, uint256 newDebt);

    event WithdrawCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);
}
