/* SPDX-License-Identifier: LGPL-3.0-or-later */
pragma solidity ^0.7.1;

import "./BalanceSheetStorage.sol";
import "./math/Exponential.sol";

/**
 * @title BalanceSheetInterface
 * @author Mainframe
 */
abstract contract BalanceSheetInterface is BalanceSheetStorage, Exponential {
    /**
     * CONSTANT FUNCTIONS
     */
    function getCurrentCollateralizationRatio(YTokenInterface yToken, address account)
        external
        virtual
        view
        returns (uint256);

    function getHypotheticalCollateralizationRatio(
        YTokenInterface yToken,
        address account,
        uint256 lockedCollateralAmount,
        uint256 debt
    ) public virtual view returns (uint256);

    function getVault(YTokenInterface yToken, address account)
        external
        virtual
        view
        returns (
            uint256,
            uint256,
            uint256,
            bool
        );

    function isVaultOpen(YTokenInterface yToken, address account) external virtual view returns (bool);

    /**
     * NON-CONSTANT FUNCTIONS
     */
    function depositCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function freeCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function openVault(YTokenInterface yToken) external virtual returns (bool);

    function lockCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    function setVaultDebt(
        YTokenInterface yToken,
        address account,
        uint256 newVaultDebt
    ) external virtual returns (bool);

    function withdrawCollateral(YTokenInterface yToken, uint256 collateralAmount) external virtual returns (bool);

    /**
     * EVENTS
     */
    event DepositCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);

    event FreeCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);

    event OpenVault(YTokenInterface indexed yToken, address indexed account);

    event LockCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);

    event SetVaultDebt(YTokenInterface indexed yToken, address indexed account, uint256 oldDebt, uint256 newDebt);

    event WithdrawCollateral(YTokenInterface indexed yToken, address indexed account, uint256 collateralAmount);
}
