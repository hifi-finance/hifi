/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

import "../IBalanceSheet.sol";
import "../IHToken.sol";

/// @title IBatterseaTargetV1
/// @author Hifi
/// @notice Interface for the BatterseaTargetV1 contract
interface IBatterseaTargetV1 {
    /// EVENTS

    /// @notice Emitted when hTokens are borrowed and sold.
    /// @param borrower The address of the borrower.
    /// @param borrowAmount The amount of borrow funds.
    /// @param hTokenDelta The hToken delta.
    /// @param underlyingAmount The amount of underlying tokens.
    event BorrowAndSellHTokens(
        address indexed borrower,
        uint256 borrowAmount,
        uint256 hTokenDelta,
        uint256 underlyingAmount
    );

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Borrows hTokens.
    /// @param hToken The address of the HToken contract.
    /// @param borrowAmount The amount of hTokens to borrow.
    function borrow(IHToken hToken, uint256 borrowAmount) external;

    /// @notice Borrows hTokens and sells them on Balancer in exchange for underlying.
    ///
    /// @dev Emits a {BorrowAndSellHTokens} event.
    ///
    /// This is a payable function so it can receive ETH transfers.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param borrowAmount The amount of hTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell hTokens for.
    function borrowAndSellHTokens(
        IHToken hToken,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable;

    /// @notice Deposits collateral into the BalanceSheet contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to deposit.
    function depositCollateral(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount
    ) external;

    /// @notice Deposits and locks collateral into the BalanceSheet contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to deposit and lock.
    function depositAndLockCollateral(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount
    ) external;

    /// @notice Deposits and locks collateral into the vault via the BalanceSheet contract
    /// and borrows hTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to deposit and lock.
    /// @param borrowAmount The amount of hTokens to borrow.
    function depositAndLockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external payable;

    /// @notice Deposits and locks collateral into the vault via the BalanceSheet contract, borrows hTokens
    /// and sells them on Balancer in exchange for underlying.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to deposit and lock.
    /// @param borrowAmount The amount of hTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell hTokens for.
    function depositAndLockCollateralAndBorrowAndSellHTokens(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable;

    /// @notice Frees collateral from the vault in the BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to free.
    function freeCollateral(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount
    ) external;

    /// @notice Frees collateral from the vault and withdraws it from the
    /// BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to free and withdraw.
    function freeAndWithdrawCollateral(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount
    ) external;

    /// @notice Locks collateral in the vault in the BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to lock.
    function lockCollateral(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount
    ) external;

    /// @notice Locks collateral into the vault in the BalanceSheet contract
    /// and draws debt via the HToken contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to lock.
    /// @param borrowAmount The amount of hTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell hTokens for.
    function lockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external;

    /// @notice Open the vaults in the BalanceSheet contract for the given hToken.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    function openVault(IBalanceSheet balanceSheet, IHToken hToken) external;

    /// @notice Redeems hTokens in exchange for underlying tokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `repayAmount` hTokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to redeem.
    function redeemHTokens(IHToken hToken, uint256 hTokenAmount) external;

    /// @notice Repays the hToken borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `repayAmount` hTokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param repayAmount The amount of hTokens to repay.
    function repayBorrow(IHToken hToken, uint256 repayAmount) external;

    /// @notice Market sells underlying and repays the borrows via the HToken contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to sell.
    /// @param repayAmount The amount of hTokens to repay.
    function sellUnderlyingAndRepayBorrow(
        IHToken hToken,
        uint256 underlyingAmount,
        uint256 repayAmount
    ) external;

    /// @notice Supplies the underlying to the RedemptionPool contract and mints hTokens.
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlying(IHToken hToken, uint256 underlyingAmount) external;

    /// @notice Supplies the underlying to the RedemptionPool contract, mints hTokens
    /// and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlyingAndRepayBorrow(IHToken hToken, uint256 underlyingAmount) external;

    /// @notice Withdraws collateral from the vault in the BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to withdraw.
    function withdrawCollateral(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 collateralAmount
    ) external;

    /// @notice Wraps ETH into WETH and deposits into the BalanceSheet contract.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    function wrapEthAndDepositCollateral(IBalanceSheet balanceSheet, IHToken hToken) external payable;

    /// @notice Wraps ETH into WETH, deposits and locks collateral into the BalanceSheet contract
    /// and borrows hTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    function wrapEthAndDepositAndLockCollateral(IBalanceSheet balanceSheet, IHToken hToken) external payable;

    /// @notice Wraps ETH into WETH, deposits and locks collateral into the vault in the BalanceSheet
    /// contracts and borrows hTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param borrowAmount The amount of hTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell hTokens for.
    function wrapEthAndDepositAndLockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IHToken hToken,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable;

    /// CONSTANT FUNCTIONS ///

    /// @notice The contract that enables trading on the Balancer Exchange.
    /// @dev This is the mainnet version of the Exchange Proxy. Change it with the testnet version when needed.
    function EXCHANGE_PROXY_ADDRESS() external view returns (address);

    /// @notice The contract that enables wrapping ETH into ERC-20 form.
    /// @dev This is the mainnet version of WETH. Change it with the testnet version when needed.
    function WETH_ADDRESS() external view returns (address);
}
