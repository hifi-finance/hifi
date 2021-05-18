/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";

import "./IFyToken.sol";
import "./IFintroller.sol";

/// @title IBalanceSheet
/// @author Hifi
/// @notice Interface for the BalanceSheet contract
interface IBalanceSheet is
    IAdmin /// one dependency
{
    /// @notice Structure of a vault.
    /// @param debt The current debt of the account.
    /// @param freeCollateral The current amount of free collateral.
    /// @param lockedCollateral The current amount of locked collateral.
    /// @param isOpen True if the vault is open.
    struct Vault {
        uint256 debt;
        uint256 freeCollateral;
        uint256 lockedCollateral;
        bool isOpen;
    }

    /// EVENTS ///

    /// @notice Emitted when collateral is clutched.
    /// @param fyToken The related FyToken.
    /// @param liquidator The address of the liquidator.
    /// @param borrower The address of the liquidated borrower.
    /// @param collateralAmount The amount of clutched collateral.
    event ClutchCollateral(
        IFyToken indexed fyToken,
        address indexed liquidator,
        address indexed borrower,
        uint256 collateralAmount
    );

    /// @notice Emitted when the default of a vault is decreased.
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    /// @param oldDebt The amount of the old debt.
    /// @param newDebt The amount of the new debt.
    event DecreaseVaultDebt(IFyToken indexed fyToken, address indexed borrower, uint256 oldDebt, uint256 newDebt);

    /// @notice Emitted when collateral is deposited.
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of deposited collateral.
    event DepositCollateral(IFyToken indexed fyToken, address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when collateral is freed.
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of freed collateral.
    event FreeCollateral(IFyToken indexed fyToken, address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when collateral is locked
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of locked collateral.
    event LockCollateral(IFyToken indexed fyToken, address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when a vault is opened.
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    event OpenVault(IFyToken indexed fyToken, address indexed borrower);

    /// @notice Emitted when the debt of a vault is increased.
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    /// @param oldDebt The amount of the old debt.
    /// @param newDebt The amount of the new debt.
    event IncreaseVaultDebt(IFyToken indexed fyToken, address indexed borrower, uint256 oldDebt, uint256 newDebt);

    /// @notice Emitted when collateral is withdrawn.
    /// @param fyToken The related FyToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of withdrawn collateral.
    event WithdrawCollateral(IFyToken indexed fyToken, address indexed borrower, uint256 collateralAmount);

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
        IFyToken fyToken,
        address liquidator,
        address borrower,
        uint256 collateralAmount
    ) external returns (bool);

    /// @notice Decreases the debt accrued by the borrower account.
    ///
    /// @dev Emits an {DecreaseVaultDebt} event.
    ///
    /// Requirements:
    /// - Can only be called by the fyToken.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param borrower The borrower account for which to decrease the debt.
    /// @param subtractedDebt The amount by which to decrease the debt of the borrower account.
    /// @return bool=true success, otherwise it reverts.
    function decreaseVaultDebt(
        IFyToken fyToken,
        address borrower,
        uint256 subtractedDebt
    ) external returns (bool);

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
    function depositCollateral(IFyToken fyToken, uint256 collateralAmount) external returns (bool);

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
    function freeCollateral(IFyToken fyToken, uint256 collateralAmount) external returns (bool);

    /// @notice Increases the debt accrued by the borrower account.
    ///
    /// @dev Emits an {IncreaseVaultDebt} event.
    ///
    /// Requirements:
    /// - Can only be called by the fyToken.
    ///
    /// @param fyToken The address of the fyToken contract.
    /// @param borrower The borrower account for which to increase the debt.
    /// @param addedDebt The amount by which to increase the debt of the borrower account.
    /// @return bool=true success, otherwise it reverts.
    function increaseVaultDebt(
        IFyToken fyToken,
        address borrower,
        uint256 addedDebt
    ) external returns (bool);

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
    function lockCollateral(IFyToken fyToken, uint256 collateralAmount) external returns (bool);

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
    function openVault(IFyToken fyToken) external returns (bool);

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
    function withdrawCollateral(IFyToken fyToken, uint256 collateralAmount) external returns (bool);

    /// CONSTANT FUNCTIONS ///

    /// @notice The unique Fintroller associated with this contract.
    function fintroller() external view returns (IFintroller);

    /// @notice Indicator that this is a BalanceSheet contract, for inspection.
    function isBalanceSheet() external view returns (bool);

    /// @notice Determines the amount of collateral that can be clutched when liquidating a borrow.
    ///
    /// @dev The formula applied:
    /// clutchedCollateral = repayAmount * liquidationIncentive * underlyingPriceUsd / collateralPriceUsd
    ///
    /// Requirements:
    /// - `repayAmount` must be non-zero.
    ///
    /// @param fyToken The fyToken to make the query against.
    /// @param repayAmount The amount of fyTokens to repay.
    /// @return The amount of clutchable collateral as uint256, specified in the collateral's decimal system.
    function getClutchableCollateral(IFyToken fyToken, uint256 repayAmount) external view returns (uint256);

    /// @notice Determines the current collateralization ratio for the given borrower account.
    /// @param fyToken The fyToken to make the query against.
    /// @param borrower The borrower account to make the query against.
    /// @return A quotient if locked collateral is non-zero, otherwise zero.
    function getCurrentCollateralizationRatio(IFyToken fyToken, address borrower) external view returns (uint256);

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
        IFyToken fyToken,
        address borrower,
        uint256 lockedCollateral,
        uint256 debt
    ) external view returns (uint256);

    /// @notice Reads the storage properties of the vault.
    /// @return The vault object.
    function getVault(IFyToken fyToken, address borrower) external view returns (Vault memory);

    /// @notice Reads the debt held by the given account.
    /// @return The debt held by the borrower, as an uint256.
    function getVaultDebt(IFyToken fyToken, address borrower) external view returns (uint256);

    /// @notice Reads the amount of collateral that the given borrower account locked in the vault.
    /// @return The collateral locked in the vault by the borrower, as an uint256.
    function getVaultLockedCollateral(IFyToken fyToken, address borrower) external view returns (uint256);

    /// @notice Checks whether the borrower account can be liquidated or not.
    /// @param fyToken The fyToken for which to make the query against.
    /// @param borrower The borrower account for which to make the query against.
    /// @return bool true = is underwater, otherwise not.
    function isAccountUnderwater(IFyToken fyToken, address borrower) external view returns (bool);

    /// @notice Checks whether the borrower account has a vault opened for a particular fyToken.
    /// @return bool true = vault open, otherwise not.
    function isVaultOpen(IFyToken fyToken, address borrower) external view returns (bool);
}
