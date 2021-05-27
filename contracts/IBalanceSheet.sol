/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";

import "./IHToken.sol";
import "./IFintroller.sol";

/// @title IBalanceSheet
/// @author Hifi
/// @notice Interface for the BalanceSheet contract
interface IBalanceSheet is
    IAdmin /// one dependency
{
    /// STRUCTS ///

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
    /// @param hToken The related HToken.
    /// @param liquidator The address of the liquidator.
    /// @param borrower The address of the liquidated borrower.
    /// @param collateralAmount The amount of clutched collateral.
    event ClutchCollateral(
        IHToken indexed hToken,
        address indexed liquidator,
        address indexed borrower,
        uint256 collateralAmount
    );

    /// @notice Emitted when the default of a vault is decreased.
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    /// @param oldDebt The amount of the old debt.
    /// @param newDebt The amount of the new debt.
    event DecreaseVaultDebt(IHToken indexed hToken, address indexed borrower, uint256 oldDebt, uint256 newDebt);

    /// @notice Emitted when collateral is deposited.
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of deposited collateral.
    event DepositCollateral(IHToken indexed hToken, address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when collateral is freed.
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of freed collateral.
    event FreeCollateral(IHToken indexed hToken, address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when collateral is locked
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of locked collateral.
    event LockCollateral(IHToken indexed hToken, address indexed borrower, uint256 collateralAmount);

    /// @notice Emitted when a vault is opened.
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    event OpenVault(IHToken indexed hToken, address indexed borrower);

    /// @notice Emitted when the debt of a vault is increased.
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    /// @param oldDebt The amount of the old debt.
    /// @param newDebt The amount of the new debt.
    event IncreaseVaultDebt(IHToken indexed hToken, address indexed borrower, uint256 oldDebt, uint256 newDebt);

    /// @notice Emitted when collateral is withdrawn.
    /// @param hToken The related HToken.
    /// @param borrower The address of the borrower.
    /// @param collateralAmount The amount of withdrawn collateral.
    event WithdrawCollateral(IHToken indexed hToken, address indexed borrower, uint256 collateralAmount);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Transfers the collateral from the borrower's vault to the liquidator account.
    ///
    /// @dev Emits a {ClutchCollateral} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the hToken.
    /// - There must be enough collateral in the borrower's vault.
    ///
    /// @param hToken The address of the hToken contract.
    /// @param liquidator The account who repays the borrower's debt and receives the collateral.
    /// @param borrower The account who fell underwater and is liquidated.
    /// @param collateralAmount The amount of collateral to clutch, specified in the collateral's decimal system.
    function clutchCollateral(
        IHToken hToken,
        address liquidator,
        address borrower,
        uint256 collateralAmount
    ) external;

    /// @notice Decreases the debt accrued by the borrower account.
    ///
    /// @dev Emits an {DecreaseVaultDebt} event.
    ///
    /// Requirements:
    /// - Can only be called by the hToken.
    ///
    /// @param hToken The address of the hToken contract.
    /// @param borrower The borrower account for which to decrease the debt.
    /// @param subtractedDebt The amount by which to decrease the debt of the borrower account.
    function decreaseVaultDebt(
        IHToken hToken,
        address borrower,
        uint256 subtractedDebt
    ) external;

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
    /// @param hToken The address of the hToken contract.
    /// @param collateralAmount The amount of collateral to deposit.
    function depositCollateral(IHToken hToken, uint256 collateralAmount) external;

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
    /// @param hToken The address of the hToken contract.
    /// @param collateralAmount The amount of locked collateral to free.
    function freeCollateral(IHToken hToken, uint256 collateralAmount) external;

    /// @notice Increases the debt accrued by the borrower account.
    ///
    /// @dev Emits an {IncreaseVaultDebt} event.
    ///
    /// Requirements:
    /// - Can only be called by the hToken.
    ///
    /// @param hToken The address of the hToken contract.
    /// @param borrower The borrower account for which to increase the debt.
    /// @param addedDebt The amount by which to increase the debt of the borrower account.
    function increaseVaultDebt(
        IHToken hToken,
        address borrower,
        uint256 addedDebt
    ) external;

    /// @notice Locks a portion or all of the free collateral to make it eligible for borrowing.
    /// @dev Emits a {LockCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The amount to lock cannot be zero.
    /// - There must be enough free collateral.
    ///
    /// @param hToken The address of the hToken contract.
    /// @param collateralAmount The amount of free collateral to lock.
    function lockCollateral(IHToken hToken, uint256 collateralAmount) external;

    /// @notice Opens a Vault for the caller.
    /// @dev Emits an {OpenVault} event.
    ///
    /// Requirements:
    ///
    /// - The bond must be listed.
    /// - The vault cannot be already open.
    /// - The hToken must pass the inspection.
    ///
    /// @param hToken The address of the hToken contract for which to open the vault.
    function openVault(IHToken hToken) external;

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
    /// @param hToken The address of the hToken contract.
    /// @param collateralAmount The amount of collateral to withdraw.
    function withdrawCollateral(IHToken hToken, uint256 collateralAmount) external;

    /// CONSTANT FUNCTIONS ///

    /// @notice The unique Fintroller associated with this contract.
    function fintroller() external view returns (IFintroller);

    /// @notice Determines the amount of collateral that can be clutched when liquidating a borrow.
    ///
    /// @dev The formula applied:
    /// clutchedCollateral = repayAmount * liquidationIncentive * underlyingPriceUsd / collateralPriceUsd
    ///
    /// Requirements:
    /// - `repayAmount` must be non-zero.
    ///
    /// @param hToken The hToken to make the query against.
    /// @param repayAmount The amount of hTokens to repay.
    /// @return The amount of clutchable collateral as uint256, specified in the collateral's decimal system.
    function getClutchableCollateral(IHToken hToken, uint256 repayAmount) external view returns (uint256);

    /// @notice Determines the current collateralization ratio for the given borrower account.
    /// @param hToken The hToken to make the query against.
    /// @param borrower The borrower account to make the query against.
    /// @return A quotient if locked collateral is non-zero, otherwise zero.
    function getCurrentCollateralizationRatio(IHToken hToken, address borrower) external view returns (uint256);

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
    /// @param hToken The hToken for which to make the query against.
    /// @param borrower The borrower account for which to make the query against.
    /// @param lockedCollateral The hypothetical locked collateral.
    /// @param debt The hypothetical debt.
    /// @return The hypothetical collateralization ratio as a percentage if locked collateral is non-zero,
    /// otherwise zero.
    function getHypotheticalCollateralizationRatio(
        IHToken hToken,
        address borrower,
        uint256 lockedCollateral,
        uint256 debt
    ) external view returns (uint256);

    /// @notice Reads the storage properties of the vault.
    /// @return The vault object.
    function getVault(IHToken hToken, address borrower) external view returns (Vault memory);

    /// @notice Reads the debt held by the given account.
    /// @return The debt held by the borrower, as an uint256.
    function getVaultDebt(IHToken hToken, address borrower) external view returns (uint256);

    /// @notice Reads the amount of collateral that the given borrower account locked in the vault.
    /// @return The collateral locked in the vault by the borrower, as an uint256.
    function getVaultLockedCollateral(IHToken hToken, address borrower) external view returns (uint256);

    /// @notice Checks whether the borrower account can be liquidated or not.
    /// @param hToken The hToken for which to make the query against.
    /// @param borrower The borrower account for which to make the query against.
    /// @return bool true = is underwater, otherwise not.
    function isAccountUnderwater(IHToken hToken, address borrower) external view returns (bool);

    /// @notice Indicator that this is a BalanceSheet contract, for inspection.
    function isBalanceSheet() external view returns (bool);

    /// @notice Checks whether the borrower account has a vault opened for a particular hToken.
    /// @return bool true = vault open, otherwise not.
    function isVaultOpen(IHToken hToken, address borrower) external view returns (bool);
}
