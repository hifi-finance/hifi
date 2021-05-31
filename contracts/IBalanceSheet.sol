/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "@paulrberg/contracts/access/IAdmin.sol";
import "@paulrberg/contracts/token/erc20/IErc20.sol";

import "./oracles/IChainlinkOperator.sol";
import "./IFintroller.sol";
import "./IHToken.sol";

/// @title IBalanceSheet
/// @author Hifi
/// @notice Manages the collaterals and the debts for all users.
interface IBalanceSheet is IAdmin {
    /// STRUCTS ///

    /// @notice Structure of a vault.
    struct Vault {
        IHToken[] bondList;
        mapping(IErc20 => uint256) collateralAmounts;
        IErc20[] collateralList;
        mapping(IHToken => uint256) debtAmounts;
    }

    /// EVENTS ///

    /// @notice Emitted when a borrow is made.
    /// @param bond The address of the bond contract.
    /// @param account The address of the borrower.
    /// @param borrowAmount The amount of hTokens borrowed.
    event Borrow(IHToken bond, address indexed account, uint256 borrowAmount);

    /// @notice Emitted when collateral is deposited.
    /// @param collateral The related collateral.
    /// @param account The address of the borrower.
    /// @param collateralAmount The amount of deposited collateral.
    event DepositCollateral(IErc20 indexed collateral, address indexed account, uint256 collateralAmount);

    /// @notice Emitted when a borrow is liquidated.
    /// @param bond The address of the bond contract.
    /// @param liquidator The address of the liquidator.
    /// @param borrower The address of the borrower.
    /// @param repayAmount The amount of repaid funds.
    /// @param collateral The address of the collateral contract.
    /// @param clutchedCollateralAmount The amount of clutched collateral.
    event LiquidateBorrow(
        IHToken indexed bond,
        address indexed liquidator,
        address indexed borrower,
        uint256 repayAmount,
        IErc20 collateral,
        uint256 clutchedCollateralAmount
    );

    /// @notice Emitted when a borrow is repaid.
    /// @param bond The address of the bond contract.
    /// @param payer The address of the payer.
    /// @param borrower The address of the borrower.
    /// @param repayAmount The amount of repaid funds.
    /// @param newDebtAmount The amount of the new debt.
    event RepayBorrow(
        IHToken indexed bond,
        address indexed payer,
        address indexed borrower,
        uint256 repayAmount,
        uint256 newDebtAmount
    );

    /// @notice Emitted when a new oracle is set.
    /// @param admin The address of the admin.
    /// @param oldOracle The address of the old oracle.
    /// @param newOracle The address of the new oracle.
    event SetOracle(address indexed admin, address oldOracle, address newOracle);

    /// @notice Emitted when collateral is withdrawn.
    /// @param collateral The related collateral.
    /// @param account The address of the borrower.
    /// @param collateralAmount The amount of withdrawn collateral.
    event WithdrawCollateral(IErc20 indexed collateral, address indexed account, uint256 collateralAmount);

    /// CONSTANT FUNCTIONS ///

    /// @notice The unique Fintroller associated with this contract.
    function fintroller() external view returns (IFintroller);

    /// @notice Reads the bonds the given account has borrowed in.

    /// @dev It is not an error to provide an invalid address.
    /// @param account The account to make the query gainst.
    /// @return The list of bonds the account has borrowed in.
    function getBondList(address account) external view returns (IHToken[] memory);

    /// @notice Reads the collateral the given account has deposited.
    /// @dev It is not an error to provide an invalid address.
    /// @param account The account to make the query gainst.
    /// @return The list of collaterals the account has deposited.
    function getCollateralList(address account) external view returns (IErc20[] memory);

    /// @notice Calculates the amount of collateral that can be clutched when liquidating a borrow. Note that this
    /// is for informational purposes only, it doesn't tell anything about whether the user can be liquidated.
    ///
    /// @dev NoteThe formula applied:
    /// clutchedCollateral = repayAmount * liquidationIncentive * underlyingPriceUsd / collateralPriceUsd
    ///
    /// Requirements:
    /// - The amount to repay cannot be zero.
    ///
    /// @param bond The bond to make the query against.
    /// @param repayAmount The amount of hTokens to repay.
    /// @param collateral The collateral to make the query against.
    /// @return clutchableCollateralAmount The amount of clutchable collateral.
    function getClutchableCollateralAmount(
        IHToken bond,
        uint256 repayAmount,
        IErc20 collateral
    ) external view returns (uint256 clutchableCollateralAmount);

    /// @notice Calculates the current account liquidity.
    /// @param account The account to make the query against.
    /// @return excessLiquidity account liquidity in excess of collateral requirements.
    /// @return shortfallLiquidity account shortfall below collateral requirements
    function getCurrentAccountLiquidity(address account)
        external
        view
        returns (uint256 excessLiquidity, uint256 shortfallLiquidity);

    /// @notice Calculates the account liquidity given a modified collateral and debt amount, at the current prices
    /// provided by the oracle.
    ///
    /// @dev Works by summing up each collateral amount multiplied by the USD value of each unit and divided by its
    /// respective collateralization ratio, then dividing the sum by the total amount of debt drawn by the user.
    ///
    /// Caveats:
    /// - This function expects that the "collateralList" and the "bondList" are each modified in advance to include
    /// the collateral and bond due to be modified.
    ///
    /// @param account The account to make the query against.
    /// @param collateralModify The collateral to make the check against.
    /// @param collateralAmountModify The hypothetical normalized amount of collateral.
    /// @param bondModify The bond to make the hypothetical check against.
    /// @param debtAmountModify The hypothetical amount of debt.
    /// @return excessLiquidity hypothetical account liquidity in excess of collateral requirements.
    /// @return shortfallLiquidity hypothetical account shortfall below collateral requirements
    function getHypotheticalAccountLiquidity(
        address account,
        IErc20 collateralModify,
        uint256 collateralAmountModify,
        IHToken bondModify,
        uint256 debtAmountModify
    ) external view returns (uint256 excessLiquidity, uint256 shortfallLiquidity);

    /// @notice The contract that provides price data.
    function oracle() external view returns (IChainlinkOperator);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Increases the debt of the caller and mints new hTokens.
    ///
    /// @dev Emits a {Borrow} event.
    ///
    /// Requirements:
    ///
    /// - Must be called prior to bond maturation.
    /// - The amount to borrow cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The new length of the bond list must be below the max bonds limit.
    /// - The new total amount of debt cannot exceed the debt ceiling.
    /// - The caller must not end up having a shortfall of liquidity.
    ///
    /// @param bond The address of the bond contract.
    /// @param borrowAmount The amount of hTokens to borrow and print into existence.
    function borrow(IHToken bond, uint256 borrowAmount) external;

    /// @notice Deposits collateral in the caller's account.
    ///
    /// @dev Emits a {DepositCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The amount to deposit cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The caller must have allowed this contract to spend `collateralAmount` tokens.
    ///
    /// @param collateral The address of the collateral contract.
    /// @param depositAmount The amount of collateral to deposit.
    function depositCollateral(IErc20 collateral, uint256 depositAmount) external;

    /// @notice Repays the debt of the borrower and rewards the caller with a surplus of collateral.
    ///
    /// @dev Emits a {LiquidateBorrow} event.
    ///
    /// Requirements:
    ///
    /// - All from "repayBorrow".
    /// - The caller cannot be the same with the borrower.
    /// - The Fintroller must allow this action to be performed.
    /// - The borrower must have a shortfall of liquidity if the bond didn't mature.
    /// - The amount of clutched collateral cannot be more than what the borrower has in the vault.
    ///
    /// @param bond The address of the bond contract.
    /// @param borrower The account to liquidate.
    /// @param repayAmount The amount of hTokens to repay.
    /// @param collateral The address of the collateral contract.
    function liquidateBorrow(
        IHToken bond,
        address borrower,
        uint256 repayAmount,
        IErc20 collateral
    ) external;

    /// @notice Erases the borrower's debt and takes the hTokens out of circulation.
    ///
    /// @dev Emits a {RepayBorrow} event.
    ///
    /// Requirements:
    ///
    /// - The amount to repay cannot be zero.
    /// - The Fintroller must allow this action to be performed.
    /// - The caller must have at least `repayAmount` hTokens.
    /// - The caller must have at least `repayAmount` debt.
    ///
    /// @param bond The address of the bond contract.
    /// @param repayAmount The amount of hTokens to repay.
    function repayBorrow(IHToken bond, uint256 repayAmount) external;

    /// @notice Erases the borrower's debt and takes the hTokens out of circulation.
    ///
    /// @dev Emits a {RepayBorrow} event.
    ///
    /// Requirements:
    /// - Same as the `repayBorrow` function, but here `borrower` is the account that must have at least
    /// `repayAmount` hTokens to repay the borrow.
    ///
    /// @param bond The address of the bond contract.
    /// @param borrower The borrower account for which to repay the borrow.
    /// @param repayAmount The amount of hTokens to repay.
    function repayBorrowBehalf(
        IHToken bond,
        address borrower,
        uint256 repayAmount
    ) external;

    /// @notice Updates the oracle contract's address saved in storage.
    ///
    /// @dev Emits a {SetOracle} event.
    ///
    /// Requirements:
    ///
    /// - The caller must be the admin.
    /// - The new address cannot be the zero address.
    ///
    /// @param newOracle The new oracle contract.
    function setOracle(IChainlinkOperator newOracle) external;

    /// @notice Withdraws a portion or all of the collateral.
    ///
    /// @dev Emits a {WithdrawCollateral} event.
    ///
    /// Requirements:
    ///
    /// - The amount to withdraw cannot be zero.
    /// - There must be enough collateral in the vault.
    /// - The caller's account cannot fall below the collateralization ratio.
    ///
    /// @param collateral The address of the collateral contract.
    /// @param withdrawAmount The amount of collateral to withdraw.
    function withdrawCollateral(IErc20 collateral, uint256 withdrawAmount) external;
}
