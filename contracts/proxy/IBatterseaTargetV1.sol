/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity ^0.8.0;

import "../interfaces/IBalanceSheet.sol";
import "../interfaces/IFyToken.sol";

interface IBatterseaTargetV1 {
    /// EVENTS

    event BorrowAndSellFyTokens(
        address indexed borrower,
        uint256 borrowAmount,
        uint256 fyTokenDelta,
        uint256 underlyingAmount
    );


    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Borrows fyTokens and sells them on Balancer in exchange for underlying.
    ///
    /// @dev Emits a {BorrowAndSellFyTokens} event.
    ///
    /// This is a payable function so it can receive ETH transfers.
    ///
    /// @param fyToken The address of the FyToken contract.
    /// @param borrowAmount The amount of fyTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell fyTokens for.
    function borrowAndSellFyTokens(
        IFyToken fyToken,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable;

    /// @notice Deposits collateral into the BalanceSheet contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to deposit.
    function depositCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external;

    /// @notice Deposits and locks collateral into the BalanceSheet contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to deposit and lock.
    function depositAndLockCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external;

    /// @notice Deposits and locks collateral into the vault via the BalanceSheet contract
    /// and borrows fyTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to deposit and lock.
    /// @param borrowAmount The amount of fyTokens to borrow.
    function depositAndLockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external payable;

    /// @notice Deposits and locks collateral into the vault via the BalanceSheet contract, borrows fyTokens
    /// and sells them on Balancer in exchange for underlying.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to deposit and lock.
    /// @param borrowAmount The amount of fyTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell fyTokens for.
    function depositAndLockCollateralAndBorrowAndSellFyTokens(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external payable;

    /// @notice Frees collateral from the vault in the BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to free.
    function freeCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external;

    /// @notice Frees collateral from the vault and withdraws it from the
    /// BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to free and withdraw.
    function freeAndWithdrawCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external;

    /// @notice Locks collateral in the vault in the BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to lock.
    function lockCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external;

    /// @notice Locks collateral into the vault in the BalanceSheet contract
    /// and draws debt via the FyToken contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to lock.
    /// @param borrowAmount The amount of fyTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell fyTokens for.
    function lockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 underlyingAmount
    ) external;

    /// @notice Open the vaults in the BalanceSheet contract for the given fyToken.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    function openVault(IBalanceSheet balanceSheet, IFyToken fyToken) external;

    /// @notice Redeems fyTokens in exchange for underlying tokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `repayAmount` fyTokens.
    ///
    /// @param fyToken The address of the FyToken contract.
    /// @param fyTokenAmount The amount of fyTokens to redeem.
    function redeemFyTokens(IFyToken fyToken, uint256 fyTokenAmount) external;

    /// @notice Repays the fyToken borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `repayAmount` fyTokens.
    ///
    /// @param fyToken The address of the FyToken contract.
    /// @param repayAmount The amount of fyTokens to repay.
    function repayBorrow(IFyToken fyToken, uint256 repayAmount) external;

    /// @notice Market sells underlying and repays the borrows via the FyToken contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param fyToken The address of the FyToken contract.
    /// @param underlyingAmount The amount of underlying to sell.
    /// @param repayAmount The amount of fyTokens to repay.
    function sellUnderlyingAndRepayBorrow(
        IFyToken fyToken,
        uint256 underlyingAmount,
        uint256 repayAmount
    ) external;

    /// @notice Supplies the underlying to the RedemptionPool contract and mints fyTokens.
    /// @param fyToken The address of the FyToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlying(IFyToken fyToken, uint256 underlyingAmount) external;

    /// @notice Supplies the underlying to the RedemptionPool contract, mints fyTokens
    /// and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param fyToken The address of the FyToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlyingAndRepayBorrow(IFyToken fyToken, uint256 underlyingAmount) external;

    /// @notice Withdraws collateral from the vault in the BalanceSheet contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param collateralAmount The amount of collateral to withdraw.
    function withdrawCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
        uint256 collateralAmount
    ) external;

    /// @notice Wraps ETH into WETH and deposits into the BalanceSheet contract.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    function wrapEthAndDepositCollateral(IBalanceSheet balanceSheet, IFyToken fyToken) external payable;

    /// @notice Wraps ETH into WETH, deposits and locks collateral into the BalanceSheet contract
    /// and borrows fyTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    function wrapEthAndDepositAndLockCollateral(
        IBalanceSheet balanceSheet,
        IFyToken fyToken
    ) external payable;

    /// @notice Wraps ETH into WETH, deposits and locks collateral into the vault in the BalanceSheet
    /// contracts and borrows fyTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param fyToken The address of the FyToken contract.
    /// @param borrowAmount The amount of fyTokens to borrow.
    /// @param underlyingAmount The amount of underlying to sell fyTokens for.
    function wrapEthAndDepositAndLockCollateralAndBorrow(
        IBalanceSheet balanceSheet,
        IFyToken fyToken,
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
