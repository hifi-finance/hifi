/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "@paulrberg/contracts/interfaces/IErc20.sol";
import "@paulrberg/contracts/interfaces/IErc20Permit.sol";
import "@paulrberg/contracts/interfaces/IErc20Recover.sol";
import "@paulrberg/contracts/interfaces/IAdmin.sol";

import "./IFintroller.sol";
import "./IBalanceSheet.sol";
import "./IRedemptionPool.sol";

interface IFyToken is IErc20Permit, IAdmin {
    /// EVENTS ///

    event Borrow(address indexed borrower, uint256 borrowAmount);

    event Burn(address indexed holder, uint256 burnAmount);

    event LiquidateBorrow(
        address indexed liquidator,
        address indexed borrower,
        uint256 repayAmount,
        uint256 clutchedCollateralAmount
    );

    event Mint(address indexed beneficiary, uint256 mintAmount);

    event RepayBorrow(address indexed payer, address indexed borrower, uint256 repayAmount, uint256 newDebt);

    event SetFintroller(address indexed admin, IFintroller oldFintroller, IFintroller newFintroller);


    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Increases the debt of the caller and mints new fyToken.
    ///
    /// @dev Emits a {Borrow}, {Mint} and {Transfer} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - Must be called prior to maturation.
    /// - The amount to borrow cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The locked collateral cannot be zero.
    /// - The total supply of fyTokens cannot exceed the debt ceiling.
    /// - The caller must not fall below the threshold collateralization ratio.
    ///
    /// @param borrowAmount The amount of fyTokens to borrow and print into existence.
    /// @return bool true = success, otherwise it reverts.
    function borrow(uint256 borrowAmount) external returns (bool);

    /// @notice Destroys `burnAmount` tokens from `holder`, reducing the token supply.
    ///
    /// @dev Emits a {Burn} and a {Transfer} event.
    ///
    /// Requirements:
    ///
    /// - Must be called prior to maturation.
    /// - Can only be called by the RedemptionPool.
    /// - The amount to burn cannot be zero.
    ///
    /// @param holder The account whose fyTokens to burn.
    /// @param burnAmount The amount of fyTokens to burn.
    /// @return bool true = success, otherwise it reverts.
    function burn(address holder, uint256 burnAmount) external returns (bool);

    /// @notice Repays the debt of the borrower and rewards the caler with a surplus of collateral.
    ///
    /// @dev Emits a {RepayBorrow}, {Transfer}, {ClutchCollateral} and {LiquidateBorrow} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The liquidator cannot liquidate themselves.
    /// - The amount to repay cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The borrower must be underwater if the bond didn't mature.
    /// - The caller must have at least `repayAmount` fyTokens.
    /// - The borrower must have at least `repayAmount` debt.
    /// - The amount of clutched collateral cannot be more than what the borrower has in the vault.
    ///
    /// @param borrower The account to liquidate.
    /// @param repayAmount The amount of fyTokens to repay.
    /// @return bool true = success, otherwise it reverts.
    function liquidateBorrow(address borrower, uint256 repayAmount) external returns (bool);

    /// @notice Prints new tokens into existence and assigns them to `beneficiary`,
    /// increasing the total supply.
    ///
    /// @dev Emits a {Mint} and a {Transfer} event.
    ///
    /// Requirements:
    ///
    /// - Can only be called by the RedemptionPool.
    /// - The amount to mint cannot be zero.
    ///
    /// @param beneficiary The borrower account for which to mint the tokens.
    /// @param mintAmount The amount of fyTokens to print into existence.
    /// @return bool true = success, otherwise it reverts.
    function mint(address beneficiary, uint256 mintAmount) external returns (bool);

    /// @notice Deletes the borrower account's debt from the registry and take the fyTokens
    /// out of circulation.
    ///
    /// @dev Emits a {Burn}, {Transfer} and {RepayBorrow} event.
    ///
    /// Requirements:
    ///
    /// - The vault must be open.
    /// - The amount to repay cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The caller must have at least `repayAmount` fyTokens.
    /// - The caller must have at least `repayAmount` debt.
    ///
    /// @param repayAmount The amount of fyTokens to repay.
    /// @return bool true = success, otherwise it reverts.
    function repayBorrow(uint256 repayAmount) external returns (bool);

    /// @notice Clears the borrower account's debt from the registry and take the fyTokens
    /// out of circulation.
    ///
    /// @dev Emits a {Burn}, {Transfer} and {RepayBorrow} event.
    ///
    /// Requirements:
    /// - Same as the `repayBorrow` function, but here `borrower` is the account that must have at
    /// least `repayAmount` fyTokens to repay the borrow.
    ///
    /// @param borrower The borrower account for which to repay the borrow.
    /// @param repayAmount The amount of fyTokens to repay.
    /// @return bool true = success, otherwise it reverts.
    function repayBorrowBehalf(address borrower, uint256 repayAmount) external returns (bool);

    /// @notice Updates the Fintroller contract's address saved in storage.
    ///
    /// @dev Throws a {SetFintroller} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The new Fintroller must pass the inspection.
    ///
    /// @param newFintroller The address of the new Fintroller contract.
    /// @return bool true = success, otherwise it reverts.
    function _setFintroller(IFintroller newFintroller) external returns (bool);



    /// CONSTANT FUNCTIONS ///
    function balanceSheet() external view returns (IBalanceSheet);

    function collateral() external view returns (IErc20);

    /// @notice The ratio between mantissa precision (1e18) and the collateral precision.
    function collateralPrecisionScalar() external view returns (uint256);

    /// @notice Unix timestamp in seconds for when this fyToken expires.
    function expirationTime() external view returns (uint256);

    /// @notice The unique Fintroller associated with this fyToken.
    function fintroller() external view returns (IFintroller);

    /// @notice The unique RedemptionPool associated with this fyToken.
    function redemptionPool() external view returns (IRedemptionPool);

    /// @notice The Erc20 underlying, or target, asset for this fyToken.
    function underlying() external view returns (IErc20);

    /// @notice The ratio between mantissa precision (1e18) and the underlying precision.
    function underlyingPrecisionScalar() external view returns (uint256);

    /// @notice Indicator that this is a FyToken contract, for inspection.
    function isFyToken() external view returns (bool);

    /// @notice Checks if the bond matured.
    /// @return bool true = bond matured, otherwise it didn't.
    function isMatured() external view returns (bool);
}
