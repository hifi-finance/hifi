/// SPDX-License-Identifier: LGPL-3.0-or-later
// solhint-disable func-name-mixedcase
pragma solidity >=0.8.4;

import "@hifi/amm/contracts/IHifiPool.sol";
import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";
import "@hifi/protocol/contracts/core/hToken/IHToken.sol";
import "@paulrberg/contracts/token/erc20/IErc20Permit.sol";

import "./external/WethInterface.sol";

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

    /// @notice Adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `underlyingAmount`
    /// and `maxHTokenRequired` tokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param maxHTokenRequired The maximum amount of hTokens that the user is willing to accept.
    /// @param deadline The timestamp in the future.
    /// @param signatureHToken The packed signature for HToken.
    /// @param signatureUnderlying The paked signature for Underlying.
    function addLiquidityWithSignature(
        IHifiPool hifiPool,
        IErc20Permit underlying,
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
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    function borrowHTokenAndAddLiquidity(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Borrows hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `underlyingOffered` `underlying`
    /// tokens for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature.
    function borrowHTokenAndAddLiquidityWithSignature(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        IErc20Permit underlying,
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
    /// @param hTokenOut The amount of hTokens to buy.
    /// @param maxUnderlyingAmount The maximum amount of underlying that the user is willing to sell and invest.
    function buyHTokenAndAddLiquidity(
        IHifiPool hifiPool,
        uint256 hTokenOut,
        uint256 maxUnderlyingAmount
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
        IBalanceSheetV1 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut
    ) external;

    /// @notice Buys hTokens with underlying.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `maxUnderlyingIn`
    /// tokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param hTokenOut The exact amount of hTokens that the user wants to buy.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature.
    function buyHTokenWithSignature(
        IHifiPool hifiPool,
        IErc20Permit underlying,
        uint256 hTokenOut,
        uint256 maxUnderlyingIn,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Buys hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend
    ///  `maxUnderlyingIn + underlyingOffered` tokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param hTokenOut The amount of hTokens to buy.
    /// @param maxUnderlyingAmount The maximum amount of underlying that the user is willing to sell and invest.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature.
    function buyHTokenAndAddLiquidityWithSignature(
        IHifiPool hifiPool,
        IErc20Permit underlying,
        uint256 hTokenOut,
        uint256 maxUnderlyingAmount,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Buys hTokens with underlying and repays the borrow.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend
    ///  `maxUnderlyingIn` tokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param maxUnderlyingIn The maximum amount of underlying that the user is willing to pay.
    /// @param hTokenOut The exact amount of hTokens to buy and the amount to repay and the maximum amount to repay.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature.
    function buyHTokenAndRepayBorrowWithSignature(
        IHifiPool hifiPool,
        IErc20Permit underlying,
        IBalanceSheetV1 balanceSheet,
        uint256 maxUnderlyingIn,
        uint256 hTokenOut,
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

    /// @notice Buys underlying with hTokens.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend
    ///  `maxHTokenIn` tokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlyingOut The exact amount of underlying that the user wants to buy.
    /// @param maxHTokenIn The maximum amount of hTokens that the user is willing to pay.
    /// @param deadline The timestamp in the future.
    /// @param signatureHToken The packed signature.
    function buyUnderlyingWithSignature(
        IHifiPool hifiPool,
        uint256 underlyingOut,
        uint256 maxHTokenIn,
        uint256 deadline,
        bytes memory signatureHToken
    ) external;

    /// @notice Buys underlying and adds liquidity to the AMM.
    ///
    /// - `signature` must be valid signed approval from caller to DSProxy to spend
    ///  `maxHTokenAmount` tokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param maxHTokenAmount maxHTokenAmount The maximum amount of hTokens that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The timestamp in the future.
    /// @param signatureHToken The packed signature.
    function buyUnderlyingAndAddLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 maxHTokenAmount,
        uint256 underlyingOffered,
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
        IBalanceSheetV1 balanceSheet,
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
        IBalanceSheetV1 balanceSheet,
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
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 maxBorrowAmount,
        uint256 underlyingOffered
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
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external;

    /// @notice Deposits underlying as collateral into the vault, borrows hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - The caller must have allowed the DSProxy to spend `depositAmount + underlyingOffered` tokens.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of underlying to deposit as collateral.
    /// @param underlyingOffered The amount of underlying to invest.
    function depositUnderlyingAsCollateralAndBorrowHTokenAndAddLiquidity(
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered
    ) external;

    /// @notice Deposits collateral into the vault.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `depositAmount` `collateral` tokens
    /// for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param deadline The timestamp in the future.
    /// @param signatureCollateral The packed signature.
    function depositCollateralWithSignature(
        IBalanceSheetV1 balanceSheet,
        IErc20Permit collateral,
        uint256 depositAmount,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external;

    /// @notice Deposits collateral into the vault and borrows hTokens.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `depositAmount` `collateral` tokens
    /// for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hToken The address of the HToken contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param borrowAmount The amount of hTokens to borrow.
    /// @param deadline The timestamp in the future.
    /// @param signatureCollateral The packed signature.
    function depositCollateralAndBorrowHTokenWithSignature(
        IBalanceSheetV1 balanceSheet,
        IErc20Permit collateral,
        IHToken hToken,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external;

    /// @notice Deposits collateral into the vault, borrows hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `collateralAmount` and
    /// `underlyingAmount` for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param underlying The address of the underlying contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param maxBorrowAmount The amount of hTokens to borrow and the max amount that the user is willing to invest.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The timestamp in the future.
    /// @param signatureCollateral The packed signature for collateral.
    /// @param signatureUnderlying The packed signature for underlying.
    function depositCollateralAndBorrowHTokenAndAddLiquidityWithSignature(
        IBalanceSheetV1 balanceSheet,
        IErc20Permit collateral,
        IErc20Permit underlying,
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
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `collateralAmount` and
    /// `underlyingAmount` for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of collateral to deposit.
    /// @param borrowAmount The exact amount of hTokens to borrow.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    /// @param deadline The timestamp in the future.
    /// @param signatureCollateral The packed signature for collateral.
    function depositCollateralAndBorrowHTokenAndSellHTokenWithSignature(
        IBalanceSheetV1 balanceSheet,
        IErc20Permit collateral,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 borrowAmount,
        uint256 minUnderlyingOut,
        uint256 deadline,
        bytes memory signatureCollateral
    ) external;

    /// @notice Deposits underlying as collateral into the vault, borrows hTokens and adds liquidity to the AMM.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend  `depositAmount + underlyingOffered`
    ///  for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlying The address of the underlying contract.
    /// @param hifiPool The address of the HifiPool contract.
    /// @param depositAmount The amount of underlying to deposit as collateral.
    /// @param underlyingOffered The amount of underlying to invest.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature for underlying.
    function depositUnderlyingAsCollateralAndBorrowHTokenAndAddLiquidityWithSignature(
        IBalanceSheetV1 balanceSheet,
        IErc20Permit underlying,
        IHifiPool hifiPool,
        uint256 depositAmount,
        uint256 underlyingOffered,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Redeems hTokens for underlying.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `hTokenAmount` hTokens.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to redeem.
    function redeemHToken(IHToken hToken, uint256 hTokenAmount) external;

    /// @notice Redeems hTokens for underlying.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend  `hTokenAmount`
    ///  for given `deadline` using callers current nonce.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param hTokenAmount The amount of hTokens to redeem.
    /// @param deadline The timestamp in the future.
    /// @param signatureHToken The packed signature for hToken.
    function redeemHTokenWithSignature(
        IHToken hToken,
        uint256 hTokenAmount,
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

    /// @notice Removes liquidity from the AMM, and redeems all hTokens for underlying.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    function removeLiquidityAndRedeemHToken(IHifiPool hifiPool, uint256 poolTokensBurned) external;

    /// @notice Removes liquidity from the AMM, repays the borrow and withdraws collateral.
    ///
    /// @dev Requirements:
    /// - The caller must have allowed the DSProxy to spend `poolTokensBurned` tokens.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param repayAmount The amount of hTokens to repay.
    /// @param withdrawAmount The amount of collateral to withdraw.
    function removeLiquidityAndRepayBorrowAndWithdrawCollateral(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 poolTokensBurned,
        uint256 repayAmount,
        uint256 withdrawAmount
    ) external;

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

    /// @notice Removes liquidity from the AMM.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend  `poolTokensBurned`
    ///  for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param deadline The timestamp in the future.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external;

    /// @notice Removes liquidity from the AMM, and redeems all hTokens for underlying.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend  `poolTokensBurned`
    ///  for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param deadline The timestamp in the future.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityAndRedeemHTokenWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external;

    /// @notice Removes liquidity from the AMM, repays the borrow and withdraws collateral.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend  `poolTokensBurned`
    ///  for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param collateral The address of the collateral contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param repayAmount The amount of hTokens to repay.
    /// @param withdrawAmount The amount of collateral to withdraw.
    /// @param deadline The timestamp in the future.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityAndRepayBorrowAndWithdrawCollateralWithSignature(
        IHifiPool hifiPool,
        IBalanceSheetV1 balanceSheet,
        IErc20 collateral,
        uint256 poolTokensBurned,
        uint256 repayAmount,
        uint256 withdrawAmount,
        uint256 deadline,
        bytes memory signatureLPToken
    ) external;

    /// @notice Removes liquidity from the AMM, and sells all hTokens for underlying.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `poolTokensBurned`
    ///  for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param poolTokensBurned The amount of LP tokens to burn.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    /// @param deadline The timestamp in the future.
    /// @param signatureLPToken The packed signature for LP tokens.
    function removeLiquidityAndSellHTokenWithSignature(
        IHifiPool hifiPool,
        uint256 poolTokensBurned,
        uint256 minUnderlyingOut,
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
        IBalanceSheetV1 balanceSheet,
        IHToken hToken,
        uint256 repayAmount
    ) external;

    /// @notice Repays the hToken borrow.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `repayAmount`
    ///  hTokens for given `deadline` using callers current nonce.
    ///
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hToken The address of the HToken contract.
    /// @param repayAmount The amount of hTokens to repay.
    /// @param deadline The timestamp in the future.
    /// @param signatureHToken The packed signature for HTokens.
    function repayBorrowWithSignature(
        IBalanceSheetV1 balanceSheet,
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

    /// @notice Sells hTokens for underlying.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `hTokenIn`
    ///  hTokens for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param hTokenIn The exact amount of hTokens that the user wants to sell.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    /// @param deadline The timestamp in the future.
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
        IBalanceSheetV1 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut
    ) external;

    /// @notice Sells underlying for hTokens.
    ///
    /// Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `underlyingIn`
    ///   for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param underlyingIn The exact amount of underlying that the user wants to sell.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature for underlying.
    function sellUnderlyingWithSignature(
        IHifiPool hifiPool,
        IErc20Permit underlying,
        uint256 underlyingIn,
        uint256 minHTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Sells underlying for hTokens, then uses them to repay the hToken borrow.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `underlyingIn`
    ///   for given `deadline` using callers current nonce.
    ///
    /// @param hifiPool The address of the HifiPool contract.
    /// @param underlying The address of the underlying contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingIn The exact amount of underlying that the user wants to sell.
    /// @param minHTokenOut The minimum amount of hTokens that the user is willing to accept and the maximum
    /// amount to repay.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature for underlying.
    function sellUnderlyingAndRepayBorrowWithSignature(
        IHifiPool hifiPool,
        IErc20Permit underlying,
        IBalanceSheetV1 balanceSheet,
        uint256 underlyingIn,
        uint256 minHTokenOut,
        uint256 deadline,
        bytes memory signatureUnderlying
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

    /// @notice Supplies the underlying to mint hTokens.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `underlyingAmount`
    ///   for given `deadline` using callers current nonce.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlying The address of the underlying contract.
    /// @param underlyingAmount The amount of underlying to supply.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature for underlying.
    function supplyUnderlyingWithSignature(
        IHToken hToken,
        IErc20Permit underlying,
        uint256 underlyingAmount,
        uint256 deadline,
        bytes memory signatureUnderlying
    ) external;

    /// @notice Supplies underlying to mint hTokens and repay the hToken borrow.
    ///
    /// @dev Requirements:
    /// - `signature` must be valid signed approval from caller to DSProxy to spend `underlyingAmount`
    ///   for given `deadline` using callers current nonce.
    ///
    /// @param hToken The address of the HToken contract.
    /// @param underlying The address of the underlying contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param underlyingAmount The amount of underlying to supply.
    /// @param deadline The timestamp in the future.
    /// @param signatureUnderlying The packed signature for underlying.
    function supplyUnderlyingAndRepayBorrowWithSignature(
        IHToken hToken,
        IErc20Permit underlying,
        IBalanceSheetV1 balanceSheet,
        uint256 underlyingAmount,
        uint256 deadline,
        bytes memory signatureUnderlying
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
    /// @param weth The address of the WETH contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    function wrapEthAndDepositCollateral(WethInterface weth, IBalanceSheetV1 balanceSheet) external payable;

    /// @notice Wraps ETH into WETH, deposits collateral into the vault, borrows hTokens and sells them.
    ///
    /// @dev This is a payable function so it can receive ETH transfers.
    ///
    /// @param weth The address of the WETH contract.
    /// @param balanceSheet The address of the BalanceSheet contract.
    /// @param hifiPool  The address of the HifiPool contract.
    /// @param borrowAmount The exact amount of hTokens to borrow and sell for underlying.
    /// @param minUnderlyingOut The minimum amount of underlying that the user is willing to accept.
    function wrapEthAndDepositAndBorrowHTokenAndSellHToken(
        WethInterface weth,
        IBalanceSheetV1 balanceSheet,
        IHifiPool hifiPool,
        uint256 borrowAmount,
        uint256 minUnderlyingOut
    ) external payable;
}
