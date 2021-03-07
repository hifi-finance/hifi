// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./BalanceSheetStorage.sol";

/// @title BalanceSheetInterface
/// @author Hifi
abstract contract BalanceSheetInterface is BalanceSheetStorage {
    /// EVENTS ///

    event ClutchCollateral(
        FyTokenInterface indexed fyToken,
        address indexed liquidator,
        address indexed borrower,
        uint256 collateralAmount
    );

    event DecreaseVaultDebt(
        FyTokenInterface indexed fyToken,
        address indexed borrower,
        uint256 oldDebt,
        uint256 newDebt
    );

    event DepositCollateral(FyTokenInterface indexed fyToken, address indexed borrower, uint256 collateralAmount);

    event FreeCollateral(FyTokenInterface indexed fyToken, address indexed borrower, uint256 collateralAmount);

    event LockCollateral(FyTokenInterface indexed fyToken, address indexed borrower, uint256 collateralAmount);

    event OpenVault(FyTokenInterface indexed fyToken, address indexed borrower);

    event IncreaseVaultDebt(
        FyTokenInterface indexed fyToken,
        address indexed borrower,
        uint256 oldDebt,
        uint256 newDebt
    );

    event WithdrawCollateral(FyTokenInterface indexed fyToken, address indexed borrower, uint256 collateralAmount);

    /// CONSTANT FUNCTIONS ///

    /// @notice Determines the amount of collateral that can be clutched when liquidating a borrow.
    ///
    /// @dev The formula applied:
    /// clutchedCollateral = repayAmount * liquidationIncentive * underlyingPriceUsd / collateralPriceUsd
    ///
    /// Requirements:
    ///
    /// - `repayAmount` must be non-zero.
    ///
    /// @param fyToken The fyToken to make the query against.
    /// @param repayAmount The amount of fyTokens to repay.
    /// @return The amount of clutchable collateral as uint256, specified in the collateral's decimal system.
    function getClutchableCollateral(FyTokenInterface fyToken, uint256 repayAmount)
        external
        view
        virtual
        returns (uint256);

    /// @notice Determines the current collateralization ratio for the given borrower account.
    /// @param fyToken The fyToken to make the query against.
    /// @param borrower The borrower account to make the query against.
    /// @return A quotient if locked collateral is non-zero, otherwise zero.
    function getCurrentCollateralizationRatio(FyTokenInterface fyToken, address borrower)
        public
        view
        virtual
        returns (uint256);

    /// @notice Determines the hypothetical collateralization ratio for the given locked
    /// collateral and debt, at the current prices provided by the oracle.
    ///
    /// @dev The formula applied: collateralizationRatio = lockedCollateralValueUsd / debtValueUsd
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - `debt` must be non-zero.
    /// - The oracle prices must be non-zero.
    ///
    /// @param fyToken The fyToken for which to make the query against.
    /// @param borrower The borrower account for which to make the query against.
    /// @param lockedCollateral The hypothetical locked collateral.
    /// @param debt The hypothetical debt.
    /// @return The hypothetical collateralization ratio as a percentage mantissa if locked collateral
    /// is non-zero, otherwise zero.
    function getHypotheticalCollateralizationRatio(
        FyTokenInterface fyToken,
        address borrower,
        uint256 lockedCollateral,
        uint256 debt
    ) public view virtual returns (uint256);

    /// @notice Reads the storage properties of the vault.
    /// @return The vault object.
    function getVault(FyTokenInterface fyToken, address borrower) external view virtual returns (Vault memory);

    /// @notice Reads the debt held by the given account.
    /// @return The debt held by the borrower, as an uint256.
    function getVaultDebt(FyTokenInterface fyToken, address borrower) external view virtual returns (uint256);

    /// @notice Reads the amount of collateral that the given borrower account locked in the vault.
    /// @return The collateral locked in the vault by the borrower, as an uint256.
    function getVaultLockedCollateral(FyTokenInterface fyToken, address borrower)
        external
        view
        virtual
        returns (uint256);

    /// @notice Checks whether the borrower account can be liquidated or not.
    /// @param fyToken The fyToken for which to make the query against.
    /// @param borrower The borrower account for which to make the query against.
    /// @return bool true = is underwater, otherwise not.
    function isAccountUnderwater(FyTokenInterface fyToken, address borrower) external view virtual returns (bool);

    /// @notice Checks whether the borrower account has a vault opened for a particular fyToken.
    /// @return bool true = vault open, otherwise not.
    function isVaultOpen(FyTokenInterface fyToken, address borrower) external view virtual returns (bool);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Transfers the collateral from the borrower's vault to the liquidator account.
    ///
    /// @dev Emits a {ClutchCollateral} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the fyToken.
    /// - There must be enough collateral in the borrower's vault.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param liquidator The account who repays the borrower's debt and receives the collateral.
    /// @param borrower The account who fell underwater and is liquidated.
    /// @param collateralAmount The amount of collateral to clutch, specified in the collateral's decimal system.
    /// @return bool true = success, otherwise it reverts.
    function clutchCollateral(
        FyTokenInterface fyToken,
        address liquidator,
        address borrower,
        uint256 collateralAmount
    ) external virtual returns (bool);

    /// @notice Decreases the debt accrued by the borrower account.
    ///
    /// @dev Emits an {DecreaseVaultDebt} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the fyToken.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param borrower The borrower account for which to decrease the debt.
    /// @param subtractedDebt The amount by which to decrease the debt of the borrower account.
    /// @return bool=true success, otherwise it reverts.
    function decreaseVaultDebt(
        FyTokenInterface fyToken,
        address borrower,
        uint256 subtractedDebt
    ) external virtual returns (bool);

    /// @notice Deposits collateral into the account's vault.
    ///
    /// @dev Emits a {DepositCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The amount to deposit cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The caller must have allowed this contract to spend `collateralAmount` tokens.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param collateralAmount The amount of collateral to deposit.
    /// @return bool true = success, otherwise it reverts.
    function depositCollateral(FyTokenInterface fyToken, uint256 collateralAmount) external virtual returns (bool);

    /// @notice Frees a portion or all of the locked collateral.
    /// @dev Emits a {FreeCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The amount to free cannot be zero.
    /// - There must be enough locked collateral.
    /// - The borrower account cannot fall below the collateralization ratio.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param collateralAmount The amount of locked collateral to free.
    /// @return bool true = success, otherwise it reverts.
    function freeCollateral(FyTokenInterface fyToken, uint256 collateralAmount) external virtual returns (bool);

    /// @notice Increases the debt accrued by the borrower account.
    ///
    /// @dev Emits an {IncreaseVaultDebt} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the fyToken.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param borrower The borrower account for which to increase the debt.
    /// @param addedDebt The amount by which to increase the debt of the borrower account.
    /// @return bool=true success, otherwise it reverts.
    function increaseVaultDebt(
        FyTokenInterface fyToken,
        address borrower,
        uint256 addedDebt
    ) external virtual returns (bool);

    /// @notice Locks a portion or all of the free collateral to make it eligible for borrowing.
    /// @dev Emits a {LockCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The amount to lock cannot be zero.
    /// - There must be enough free collateral.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param collateralAmount The amount of free collateral to lock.
    /// @return bool true = success, otherwise it reverts.
    function lockCollateral(FyTokenInterface fyToken, uint256 collateralAmount) external virtual returns (bool);

    /// @notice Opens a Vault for the caller.
    /// @dev Emits an {OpenVault} event.
    ///
    /// Requirements:
    ///
    /// - The bond must be listed.
    /// - The vault cannot be already open.
    /// - The fyToken must pass the inspection.
    ///
    /// @param fyToken The address of the fyToken contract for which to open the vault.
    /// @return bool true = success, otherwise it reverts.
    function openVault(FyTokenInterface fyToken) external virtual returns (bool);

    /// @notice Withdraws a portion or all of the free collateral.
    ///
    /// @dev Emits a {WithdrawCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The amount to withdraw cannot be zero.
    /// - There must be enough free collateral in the vault.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param collateralAmount The amount of collateral to withdraw.
    /// @return bool true = success, otherwise it reverts.
    function withdrawCollateral(FyTokenInterface fyToken, uint256 collateralAmount) external virtual returns (bool);
}
