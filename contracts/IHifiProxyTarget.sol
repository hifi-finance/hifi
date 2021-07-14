/// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";
import "@hifi/amm/contracts/IHifiPool.sol";

/// @title IHifiProxyTarget
/// @author Hifi
/// @notice Interface for the HifiProxyTarget contract
interface IHifiProxyTarget {
    /// EVENTS

    /// @notice Emitted when exact amount of hTokens are borrowed and sold for required amount of underlying.
    /// @param borrower The address of the borrower.
    /// @param borrowAmount The amount of borrow funds.
    /// @param underlyingAmount The amount of underlying tokens.

    event BorrowAndSellHTokens(address indexed borrower, uint256 borrowAmount, uint256 underlyingAmount);

    /// @notice Emitted when required amount of hTokens are borrowed and sold for exact amount of underlying.
    /// @param borrower The address of the borrower.
    /// @param borrowAmount The amount of borrow funds.
    /// @param underlyingAmount The amount of underlying tokens.

    event BorrowHTokensAndBuyUnderlying(address indexed borrower, uint256 borrowAmount, uint256 underlyingAmount);

    /// CONSTANT FUNCTIONS ///

    /// @notice The contract that enables wrapping ETH into ERC-20 form.
    /// @dev This is the mainnet version of WETH. Change it with the testnet version when needed.
    function WETH_ADDRESS() external view returns (address);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Borrows hTokens.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param borrowAmount The amount of hTokens to borrow.
    function borrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 borrowAmount
    ) external;

    /// @notice Borrows exact hTokens and sells them on the AMM in exchange for highest amount of underlying.
    ///
    /// @dev Emits a {BorrowAndSellHTokens} event.
    ///
    /// This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param hifiPool The amount of hTokens to borrow.
    /// @param borrowAmount The amount of hToken to borrow to sell for underlying.
    function borrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 borrowAmount
    ) external payable;

    /// @notice Borrows required hTokens and sells them on the AMM in exchange for exact underlying.
    ///
    /// @dev Emits a {BorrowHTokensAndBuyUnderlying} event.
    ///
    /// This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param hifiPool The amount of hTokens to borrow.
    /// @param underlyingAmount The exact amount of underlying to buy in exchange for required hTokens.
    function borrowHTokensAndBuyUnderlying(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 underlyingAmount
    ) external payable;

    /// @notice Burn liquidity tokens in exchange for underlying tokens and hTokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokens` tokens.
    ///
    /// @param hifiPool The address of the hifi pool contract.
    /// @param poolTokens Amount of liquidity tokens to burn.
    function burn(IHifiPool hifiPool, uint256 poolTokens) external;

    /// @notice Buys hToken with underlying.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `underlyingIn` tokens.
    ///
    /// @param hifiPool The address of the hifi pool contract.
    /// @param hTokenAmount The amount of hToken caller wants to buy.
    function buyHToken(IHifiPool hifiPool, uint256 hTokenAmount) external;

    /// @notice Market sells required amount of underlying to buy hToken, and repay the `repayAmount` of
    /// hTokens via the HToken contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingIn` of underlying tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the hifi pool contract.
    /// @param repayAmount The exact amount of hToken amount that call wants to repay
    /// for lowest amount unederlying token.
    function buyHtokenAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 repayAmount
    ) external;

    /// @notice Buys underlying with hToken.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `hTokenIn` tokens.
    ///
    /// @param hifiPool The address of the hifi pool contract.
    /// @param underlyingAmount The amount of underlying caller wants to buy.

    function buyUnderlying(IHifiPool hifiPool, uint256 underlyingAmount) external;

    /// @notice Deposits collateral into the BalanceSheet contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param collateralAmount The amount of collateral to deposit.
    function depositCollateral(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 collateralAmount
    ) external;

    /// @notice Deposits collateral into the vault via the BalanceSheet contract
    /// and borrows hTokens.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of hTokens to borrow.
    function depositAndBorrow(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external payable;

    /// @notice Deposits collateral into the vault, borrows hTokens and sells them on the AMM
    /// in exchange for underlying.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hToken The address of the HToken contract.
    /// @param hifiPool The address of the HiFiPool contract.
    /// @param collateralAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of hToken to borrow to sell for underlying.
    function depositAndBorrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external payable;

    /// @notice Mints liquidity tokens in exchange for adding underlying tokens and hTokens.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` and `hTokenRequired` tokens.
    ///
    /// @param hifiPool The address of the HiFiPool contract.
    /// @param underlyingAmount Amount of underlying tokens offered to invest.
    /// @param hTokenRequired Amount of hToken required to invest.
    function mint(
        IHifiPool hifiPool,
        uint256 underlyingAmount,
        uint256 hTokenRequired
    ) external;

    /// @notice Redeems hTokens in exchange for underlying tokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `hTokenAmount` hTokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to redeem.
    function redeem(IHToken hToken, uint256 hTokenAmount) external;

    /// @notice Repays the hToken borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `repayAmount` hTokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param repayAmount The amount of hTokens to repay.
    function repayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 repayAmount
    ) external;

    /// @notice Sells hToken for underlying.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `hTokenAmount` tokens.
    ///
    /// @param hifiPool The address of the HiFiPool contract.
    /// @param hTokenAmount The amount of hToken amount to sell for underlying.
    function sellHToken(IHifiPool hifiPool, uint256 hTokenAmount) external;

    /// @notice Sells underlying for hToken.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hifiPool The address of the HiFiPool contract.
    /// @param underlyingAmount The amount of underlying amount to sell for hToken.
    function sellUnderlying(IHifiPool hifiPool, uint256 underlyingAmount) external;

    /// @notice Market sells `underlyingAmount` of underlying and repays the `hTokenOut` amount of
    /// hTokens via the HToken contract.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param hifiPool The address of the hifi pool contract.
    /// @param underlyingAmount The exact amount of underlying that call wants to sell to repay hTokenOut.
    function sellUnderlyingAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 underlyingAmount
    ) external;

    /// @notice Supplies the underlying to the HToken contract and mints hTokens.
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlying(IHToken hToken, uint256 underlyingAmount) external;

    /// @notice Supplies the underlying to the HToken contract, mints hTokens and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlyingAndRepayBorrow(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 underlyingAmount
    ) external;

    /// @notice Withdraws collateral from the vault.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param withdrawAmount The amount of collateral to withdraw.
    function withdrawCollateral(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 withdrawAmount
    ) external;

    /// @notice Wraps ETH into WETH and deposits into the BalanceSheet contract.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    function wrapEthAndDepositCollateral(IBalanceSheetV1 balanceSheet, IHToken hToken) external payable;

    /// @notice Wraps ETH into WETH, deposits collateral into the vault, borrows hTokens and finally sell them.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param hifiPool  The address of the hifi pool contract.
    /// @param underlyingAmount The amount of underlying to sell hTokens for.
    function wrapEthAndDepositAndBorrowAndSellHTokens(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        IHifiPool hifiPool,
        uint256 underlyingAmount
    ) external payable;
}
