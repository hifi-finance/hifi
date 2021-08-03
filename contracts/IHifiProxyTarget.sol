/// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity >=0.8.4;

import "@hifi/amm/contracts/IHifiPool.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";

/// @title IHifiProxyTarget
/// @author Hifi
/// @notice DSProxy target contract with scripts for the Hifi protocol.
/// @dev Meant to be used with a DSProxy contract via DELEGATECALL.
interface IHifiProxyTarget {
    /// EVENTS

    /// @notice Emitted when hTokens are borrowed and used to buy underlying.
    /// @param borrower The address of the borrower.
    /// @param borrowAmount The amount of hTokens borrowed and sold.
    /// @param underlyingAmount The amount of underlying bought.
    event BorrowHTokenAndBuyUnderlying(address indexed borrower, uint256 borrowAmount, uint256 underlyingAmount);

    /// @notice Emitted when hTokens are borrowed and sold for underlying.
    /// @param borrower The address of the borrower.
    /// @param borrowAmount The amount of hTokens borrowed and sold.
    /// @param underlyingAmount The amount of underlying bought.
    event BorrowHTokenAndSellHToken(address indexed borrower, uint256 borrowAmount, uint256 underlyingAmount);

    /// CONSTANT FUNCTIONS ///

    /// @notice The contract that enables wrapping ETH into Erc20 form.
    function WETH_ADDRESS() external view returns (address);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` and `maxHTokenRequired` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingOffered The amount of underlying tokens to invest.
    /// @param maxHTokenRequired The maximum amount of hTokens that the user is willing to accept.
    function addLiquidity(
        IHifiPool hifiPool,
        uint256 underlyingOffered,
        uint256 maxHTokenRequired
    ) external;

    /// @notice Borrows hTokens.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param borrowAmount The amount of hTokens to borrow.
    function borrowHToken(
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 borrowAmount
    ) external;

    /// @notice Borrows hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to accept.
    /// @param underlyingOffered The amount of underlying tokens to invest.
    function borrowHTokenAndAddLiquidity(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Borrows hTokens and buys underlying.
    ///
    /// @dev Emits a {BorrowHTokenAndBuyUnderlying} event.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to pay.
    /// @param underlyingOut The exact amount of underlying that the user wants to buy.
    function borrowHTokenAndBuyUnderlying(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOut
    ) external;

    /// @notice Borrows hTokens and sells them.
    ///
    /// @dev Emits a {BorrowHTokenAndSellHToken} event.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param borrowAmount The exact amount of hTokens to borrow and sell.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function borrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external;

    /// @notice Buys hTokens with underlying.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `maxUnderlyingIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param hTokenOut The exact amount of hTokens that the user wants to buy.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    function buyHToken(
        IHifiPool hifiPool,
        uint256 hTokenOut,
        uint256 maxUnderlyingIn
    ) external;

    /// @notice Buys hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `maxUnderlyingIn + underlyingOffered` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param underyingOffered The amount of underlying tokens to invest.
    function buyHTokenAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 maxUnderlyingIn,
        uint256 underyingOffered
    ) external;

    /// @notice Buys hTokens with underlying and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `maxUnderlyingIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param hTokenOut The exact amount of hTokens to buy and the amount to repay.
    function buyHTokenAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut
    ) external;

    /// @notice Buys underlying with hTokens.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `maxHTokenIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingOut The exact amount of underlying that the user wants to buy.
    /// @param maxHTokenIn The maximum amount of hTokens that the user is willing to pay.
    function buyUnderlying(
        IHifiPool hifiPool,
        uint256 underlyingOut,
        uint256 maxHTokenIn
    ) external;

    /// @notice Buys underlying and adds liquidity to the AMM.
    ///
    /// - The caller must have allowed DSProxy to spend `maxHTokenAmount` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxHTokenAmount maxHTokenAmount The maximum amount of hTokens that the user is willing to accept.
    /// @param underlyingOffered The amount of underlying tokens to invest.
    function buyUnderlyingAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 maxHTokenAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Deposits collateral into the vault.
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

    /// @notice Deposits collateral into the vault and borrows hTokens.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hToken The address of the HToken contract.
    /// @param collateralAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of hTokens to borrow.
    function depositCollateralAndBorrowHToken(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external;

    /// @notice Deposits collateral into the vault, borrows hTokens and sells them.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param collateralAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of exact hTokens to borrow.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function depositCollateralAndBorrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external;

    /// @notice Redeems hTokens in exchange for underlying tokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `hTokenAmount` hTokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to redeem.
    function redeemHToken(IHToken hToken, uint256 hTokenAmount) external;

    /// @notice Removes liquidity from the AMM.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    function removeLiquidity(IHifiPool hifiPool, uint256 poolTokensBurned) external;

    /// @notice Removes liquidity from the AMM, and sells all hTokens for underlying.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function removeLiquidityAndSellHToken(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 minUnderlyingOut
    ) external;

    /// @notice Removes liquidity from the AMM, sells all underlying for hTokens, and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept.
    function removeLiquidityAndSellUnderlyingAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        uint256 poolTokensBurned,
        uint256 minHTokenOut
    ) external;

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

    /// @notice Sells hTokens for underlying.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `hTokenIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param hTokenIn The exact amount of hTokens that the user wants to sell.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function sellHToken(
        IHifiPool hifiPool,
        uint256 hTokenIn,
        uint256 minUnderlyingOut
    ) external;

    /// @notice Sells underlying for hTokens.
    ///
    /// Requirements:
    /// - The caller must have allowed DSProxy to spend `underlyingIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingIn The exact amount of underlying that the user wants to sell.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept.
    function sellUnderlying(
        IHifiPool hifiPool,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) external;

    /// @notice Sells underlying for hTokens, then uses them to repay the hToken borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingIn The exact amount of underlying that the user wants to sell.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept.
    function sellUnderlyingAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) external;

    /// @notice Supplies the underlying to mint hTokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlying(IHToken hToken, uint256 underlyingAmount) external;

    /// @notice Supplies underlying to mint hTokens and repay the hToken borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingAmount The amount of underlying to supply.
    function supplyUnderlyingAndRepayBorrow(
        IHToken hToken,
        IBalanceSheetV1 balanceSheet,
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

    /// @notice Wraps ETH into WETH and make a collateral deposit in the BalanceSheet contract.
    /// @dev This is a payable function so it can receive ETH transfers.
    /// @param balanceSheet The address of the BalanceSheet contract.
    function wrapEthAndDepositCollateral(IBalanceSheetV1 balanceSheet) external payable;

    /// @notice Wraps ETH into WETH, deposits collateral into the vault, borrows hTokens and sells them.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool  The address of the HifiPool contract.
    /// @param borrowAmount The exact amount of hTokens to borrow and sell for underlying.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function wrapEthAndDepositAndBorrowHTokenAndSellHToken(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external payable;
}
