/// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity >=0.8.4;

import "@hifi/amm/contracts/IHifiPool.sol";
import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";
import "@hifi/protocol/contracts/core/h-token/IHToken.sol";
import "@prb/contracts/token/erc20/IErc20Permit.sol";

import "./external/WethInterface.sol";

/// @title IHifiProxyTarget
/// @author Hifi
/// @notice DSProxy target contract with scripts for the Hifi protocol, which works with ERC-20 functions.
/// @dev Meant to be used with a DSProxy contract via DELEGATECALL.
interface IHifiProxyTarget {
    /// CUSTOM ERRORS ///

    /// @notice Emitted when the hToken slippage is higher than what the user is willing to tolerate.
    error HifiProxyTarget__AddLiquidityHTokenSlippage(uint256 expectedHTokenRequired, uint256 actualHTokenRequired);

    /// @notice Emitted when the underlying slippage is higher than what the user is willing to tolerate.
    error HifiProxyTarget__AddLiquidityUnderlyingSlippage(
        uint256 expectedUnderlyingRequired,
        uint256 actualUnderlyingRequired
    );

    /// @notice Emitted when the slippage is higher than what the user is willing to tolerate.
    error HifiProxyTarget__TradeSlippage(uint256 expectedAmount, uint256 actualAmount);

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

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` and `maxHTokenRequired` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param maxHTokenRequired The maximum amount of hTokens that the user is willing to accept.
    function addLiquidity(
        IHifiPool hifiPool,
        uint256 underlyingOffered,
        uint256 maxHTokenRequired
    ) external;

    /// @notice Adds liquidity to the AMM using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by caller to the DSProxy to spend `underlyingAmount`
    /// and `maxHTokenRequired` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param maxHTokenRequired The maximum amount of hTokens that the user is willing to accept.
    /// @param deadline The deadline beyond which the signatures are not valid anymore.
    /// @param signatureHToken The packed signature for the hToken.
    /// @param signatureUnderlying The packed signature for the underlying.
    function addLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 underlyingOffered,
        uint256 maxHTokenRequired,
        uint256 deadline,
        bytes memory signatureHToken,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Borrows hTokens.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param borrowAmount The amount of hTokens to borrow.
    function borrowHToken(
        IBalanceSheetV2 balanceSheet,
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
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    function borrowHTokenAndAddLiquidity(
        IBalanceSheetV2 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Borrows hTokens and adds liquidity to the AMM using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend
    /// `underlyingOffered` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function borrowHTokenAndAddLiquidityWithSignature(
        IBalanceSheetV2 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered,
        uint256 deadline,
        bytes memory signatureUnderlying
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
        IBalanceSheetV2 balanceSheet,
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
        IBalanceSheetV2 balanceSheet,
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
    /// @param hTokenOut The amount of hTokens to buy.
    /// @param maxUnderlyingAmount The maximum amount of underlying that the user is willing to sell and invest.
    function buyHTokenAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 hTokenOut,
        uint256 maxUnderlyingAmount
    ) external;

    /// @notice Buys hTokens and adds liquidity to the AMM using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend
    /// `maxUnderlyingIn + underlyingOffered` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param hTokenOut The amount of hTokens to buy.
    /// @param maxUnderlyingAmount The maximum amount of underlying that the user is willing to sell and invest.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function buyHTokenAndAddLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 hTokenOut,
        uint256 maxUnderlyingAmount,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Buys hTokens with underlying and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `maxUnderlyingIn` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param hTokenOut The exact amount of hTokens to buy and the amount to repay and the maximum amount to repay.
    function buyHTokenAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut
    ) external;

    /// @notice Buys hTokens with underlying and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `maxUnderlyingIn`
    /// tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param hTokenOut The exact amount of hTokens to buy and the amount to repay and the maximum amount to repay.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function buyHTokenAndRepayBorrowWithSignature(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Buys hTokens with underlying using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `maxUnderlyingIn`
    /// tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param hTokenOut The exact amount of hTokens that the user wants to buy.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function buyHTokenWithSignature(
        IHifiPool hifiPool,
        uint256 hTokenOut,
        uint256 maxUnderlyingIn,
        uint256 deadline,
        bytes memory signatureUnderlying
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
    /// @param maxHTokenAmount maxHTokenAmount The maximum amount of hTokens that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    function buyUnderlyingAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 maxHTokenAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Buys underlying and adds liquidity to the AMM.
    ///
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend
    /// `maxHTokenAmount` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxHTokenAmount maxHTokenAmount The maximum amount of hTokens that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureHToken The packed signature for the hToken.
    function buyUnderlyingAndAddLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 maxHTokenAmount,
        uint256 underlyingOffered,
        uint256 deadline,
        bytes memory signatureHToken
    ) external;

    /// @notice Buys underlying with hTokens using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `maxHTokenIn`
    /// tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingOut The exact amount of underlying that the user wants to buy.
    /// @param maxHTokenIn The maximum amount of hTokens that the user is willing to pay.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureHToken The packed signature for the hToken.
    function buyUnderlyingWithSignature(
        IHifiPool hifiPool,
        uint256 underlyingOut,
        uint256 maxHTokenIn,
        uint256 deadline,
        bytes memory signatureHToken
    ) external;

    /// @notice Deposits collateral into the vault.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param depositAmount The amount of collateral to deposit.
    function depositCollateral(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        uint256 depositAmount
    ) external;

    /// @notice Deposits collateral into the vault and borrows hTokens.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hToken The address of the HToken contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of hTokens to borrow.
    function depositCollateralAndBorrowHToken(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        IHToken hToken,
        uint256 depositAmount,
        uint256 borrowAmount
    ) external;

    /// @notice Deposits collateral into the vault, borrows hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    function depositCollateralAndBorrowHTokenAndAddLiquidity(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Deposits collateral into the vault, borrows hTokens and adds liquidity to the AMM using EIP-2612
    /// signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `collateralAmount`
    /// and `underlyingAmount` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The deadline beyond which the signatures are not valid anymore.
    /// @param signatureCollateral The packed signature for the collateral.
    /// @param signatureUnderlying The packed signature for the underlying.
    function depositCollateralAndBorrowHTokenAndAddLiquidityWithSignature(
        IBalanceSheetV2 balanceSheet,
        IErc20Permit collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered,
        uint256 deadline,
        bytes memory signatureCollateral,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Deposits collateral into the vault, borrows hTokens and sells them.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `collateralAmount` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param borrowAmount The exact amount of hTokens to borrow.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function depositCollateralAndBorrowHTokenAndSellHToken(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external;

    /// @notice Deposits collateral into the vault, borrows hTokens and sells them.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `collateralAmount`
    /// and `underlyingAmount` for the given `deadline` and the caller's current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param borrowAmount The exact amount of hTokens to borrow.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureCollateral The packed signature for the collateral.
    function depositCollateralAndBorrowHTokenAndSellHTokenWithSignature(
        IBalanceSheetV2 balanceSheet,
        IErc20Permit collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external;

    /// @notice Deposits collateral into the vault and borrows hTokens using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend
    /// `depositAmount` `collateral` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hToken The address of the HToken contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of hTokens to borrow.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureCollateral The packed signature for the collateral.
    function depositCollateralAndBorrowHTokenWithSignature(
        IBalanceSheetV2 balanceSheet,
        IErc20Permit collateral,
        IHToken hToken,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external;

    /// @notice Deposits collateral into the vault using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend
    /// `depositAmount` tokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureCollateral The packed signature for the collateral.
    function depositCollateralWithSignature(
        IBalanceSheetV2 balanceSheet,
        IErc20Permit collateral,
        uint256 depositAmount,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external;

    /// @notice Deposits the underlying in the HToken contract to mint hTokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to deposit.
    function depositUnderlying(IHToken hToken, uint256 underlyingAmount) external;

    /// @notice Deposits underlying in the HToken contract to mint hTokens, and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `depositAmount + underlyingOffered` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of underlying to deposit to mint equivalent amount of hTokens.
    /// @param underlyingOffered The amount of underlying to invest.
    function depositUnderlyingAndMintHTokenAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Deposits underlying in the HToken contract to mint hTokens, and adds liquidity to the AMM using
    /// EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend
    ///  `depositAmount + underlyingOffered` for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of underlying to deposit as collateral.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function depositUnderlyingAndMintHTokenAndAddLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Deposits underlying in the HToken contract to mint hTokens, and repays the borrow.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `underlyingAmount` tokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingAmount The amount of underlying to deposit.
    function depositUnderlyingAndRepayBorrow(
        IHToken hToken,
        IBalanceSheetV2 balanceSheet,
        uint256 underlyingAmount
    ) external;

    /// @notice Supplies underlying to mint hTokens and repay the hToken borrow using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `underlyingAmount`
    ///   for the given `deadline` and the caller's current nonce.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingAmount The amount of underlying to supply.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function depositUnderlyingAndRepayBorrowWithSignature(
        IHToken hToken,
        IBalanceSheetV2 balanceSheet,
        uint256 underlyingAmount,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Supplies the underlying to mint hTokens using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `underlyingAmount`
    ///   for the given `deadline` and the caller's current nonce.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlyingAmount The amount of underlying to supply.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function depositUnderlyingWithSignature(
        IHToken hToken,
        uint256 underlyingAmount,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Redeems the underlying in exchange for hTokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `hTokenAmount` hTokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to provide.
    /// @param underlyingAmount The amount of underlying to redeem.
    function redeem(
        IHToken hToken,
        uint256 hTokenAmount,
        uint256 underlyingAmount
    ) external;

    /// @notice Redeems hTokens for underlying using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend  `hTokenAmount`
    ///  for the given `deadline` and the caller's current nonce.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to redeem.
    /// @param underlyingAmount The amount of underlying to redeem.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureHToken The packed signature for hToken.
    function redeemWithSignature(
        IHToken hToken,
        uint256 hTokenAmount,
        uint256 underlyingAmount,
        uint256 deadline,
        bytes memory signatureHToken
    ) external;

    /// @notice Removes liquidity from the AMM.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    function removeLiquidity(IHifiPool hifiPool, uint256 poolTokensBurned) external;

    /// @notice Removes liquidity from the AMM and redeems underlying in exchange for all hTokens
    /// retrieved from the AMM.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    function removeLiquidityAndRedeem(IHifiPool hifiPool, uint256 poolTokensBurned) external;

    /// @notice Removes liquidity from the AMM, and redeems all hTokens for the underlying using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `poolTokensBurned`
    ///  for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityAndRedeemWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external;

    /// @notice Removes liquidity from the AMM, and sells all hTokens for the underlying.
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

    /// @notice Removes liquidity from the AMM, and sells all hTokens for underlying using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `poolTokensBurned`
    ///  for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityAndSellHTokenWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 minUnderlyingOut,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external;

    /// @notice Removes liquidity from the AMM, and withdraws underlying in exchange for hTokens.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    /// - Can only be called before maturation.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param withdrawAmount The amount of underlying to withdraw in exchange for hTokens.
    function removeLiquidityAndWithdrawUnderlying(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 withdrawAmount
    ) external;

    /// @notice Removes liquidity from the AMM, and withdraws underlying in exchange for hTokens
    /// using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `poolTokensBurned`
    ///  for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param withdrawAmount The amount of underlying to withdraw in exchange for hTokens.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityAndWithdrawUnderlyingWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 withdrawAmount,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external;

    /// @notice Removes liquidity from the AMM using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `poolTokensBurned`
    ///  for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 deadline,
        bytes memory signatureLPToken
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
        IBalanceSheetV2 balanceSheet,
        IHToken hToken,
        uint256 repayAmount
    ) external;

    /// @notice Repays the hToken borrow using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `repayAmount`
    ///  hTokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param repayAmount The amount of hTokens to repay.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureHToken The packed signature for HTokens.
    function repayBorrowWithSignature(
        IBalanceSheetV2 balanceSheet,
        IHToken hToken,
        uint256 repayAmount,
        uint256 deadline,
        bytes memory signatureHToken
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

    /// @notice Sells hTokens for underlying using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `hTokenIn`
    ///  hTokens for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param hTokenIn The exact amount of hTokens that the user wants to sell.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureHToken The packed signature for HTokens.
    function sellHTokenWithSignature(
        IHifiPool hifiPool,
        uint256 hTokenIn,
        uint256 minUnderlyingOut,
        uint256 deadline,
        bytes memory signatureHToken
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
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept and the maximum
    /// amount to repay.
    function sellUnderlyingAndRepayBorrow(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) external;

    /// @notice Sells underlying for hTokens, then uses them to repay the hToken borrow using EIP-2612 signatures.
    ///
    /// @dev Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `underlyingIn`
    ///   for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingIn The exact amount of underlying that the user wants to sell.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept and the maximum
    /// amount to repay.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function sellUnderlyingAndRepayBorrowWithSignature(
        IHifiPool hifiPool,
        IBalanceSheetV2 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Sells underlying for hTokens using EIP-2612 signatures.
    ///
    /// Requirements:
    /// - The `signature` must be a valid signed approval given by the caller to the DSProxy to spend `underlyingIn`
    ///   for the given `deadline` and the caller's current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingIn The exact amount of underlying that the user wants to sell.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept.
    /// @param deadline The deadline beyond which the signature is not valid anymore.
    /// @param signatureUnderlying The packed signature for the underlying.
    function sellUnderlyingWithSignature(
        IHifiPool hifiPool,
        uint256 underlyingIn,
        uint256 minHTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Withdraws collateral from the vault.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param withdrawAmount The amount of collateral to withdraw.
    function withdrawCollateral(
        IBalanceSheetV2 balanceSheet,
        IErc20 collateral,
        uint256 withdrawAmount
    ) external;

    /// @notice Wraps ETH into WETH and makes a collateral deposit in the BalanceSheet contract.
    /// @dev This is a payable function so it can receive ETH transfers.
    /// @param weth The address of the WETH contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    function wrapEthAndDepositCollateral(WethInterface weth, IBalanceSheetV2 balanceSheet) external payable;

    /// @notice Wraps ETH into WETH, deposits collateral into the vault, borrows hTokens and sells them.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param weth The address of the WETH contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param borrowAmount The exact amount of hTokens to borrow and sell for underlying.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function wrapEthAndDepositAndBorrowHTokenAndSellHToken(
        WethInterface weth,
        IBalanceSheetV2 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external payable;
}
