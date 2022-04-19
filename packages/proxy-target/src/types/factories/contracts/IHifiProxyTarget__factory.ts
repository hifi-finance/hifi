/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  IHifiProxyTarget,
  IHifiProxyTargetInterface,
} from "../../contracts/IHifiProxyTarget";
import type { Provider } from "@ethersproject/providers";
import { Contract, Signer, utils } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedHTokenRequired",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actualHTokenRequired",
        type: "uint256",
      },
    ],
    name: "HifiProxyTarget__AddLiquidityHTokenSlippage",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedUnderlyingRequired",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actualUnderlyingRequired",
        type: "uint256",
      },
    ],
    name: "HifiProxyTarget__AddLiquidityUnderlyingSlippage",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actualAmount",
        type: "uint256",
      },
    ],
    name: "HifiProxyTarget__TradeSlippage",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
    ],
    name: "BorrowHTokenAndBuyUnderlying",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
    ],
    name: "BorrowHTokenAndSellHToken",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxHTokenRequired",
        type: "uint256",
      },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxHTokenRequired",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureHToken",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "addLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
    ],
    name: "borrowHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
    ],
    name: "borrowHTokenAndAddLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "borrowHTokenAndAddLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOut",
        type: "uint256",
      },
    ],
    name: "borrowHTokenAndBuyUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
    ],
    name: "borrowHTokenAndSellHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxUnderlyingIn",
        type: "uint256",
      },
    ],
    name: "buyHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxUnderlyingAmount",
        type: "uint256",
      },
    ],
    name: "buyHTokenAndAddLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxUnderlyingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "buyHTokenAndAddLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxUnderlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
    ],
    name: "buyHTokenAndRepayBorrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxUnderlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "buyHTokenAndRepayBorrowWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxUnderlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "buyHTokenWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxHTokenIn",
        type: "uint256",
      },
    ],
    name: "buyUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxHTokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
    ],
    name: "buyUnderlyingAndAddLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "maxHTokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureHToken",
        type: "bytes",
      },
    ],
    name: "buyUnderlyingAndAddLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxHTokenIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureHToken",
        type: "bytes",
      },
    ],
    name: "buyUnderlyingWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
    ],
    name: "depositCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
    ],
    name: "depositCollateralAndBorrowHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
    ],
    name: "depositCollateralAndBorrowHTokenAndAddLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20Permit",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureCollateral",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "depositCollateralAndBorrowHTokenAndAddLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
    ],
    name: "depositCollateralAndBorrowHTokenAndSellHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20Permit",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureCollateral",
        type: "bytes",
      },
    ],
    name: "depositCollateralAndBorrowHTokenAndSellHTokenWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20Permit",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureCollateral",
        type: "bytes",
      },
    ],
    name: "depositCollateralAndBorrowHTokenWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20Permit",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureCollateral",
        type: "bytes",
      },
    ],
    name: "depositCollateralWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
    ],
    name: "depositUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
    ],
    name: "depositUnderlyingAndMintHTokenAndAddLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingOffered",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "depositUnderlyingAndMintHTokenAndAddLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
    ],
    name: "depositUnderlyingAndRepayBorrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "depositUnderlyingAndRepayBorrowWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "depositUnderlyingWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
    ],
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureHToken",
        type: "bytes",
      },
    ],
    name: "redeemWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
    ],
    name: "removeLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
    ],
    name: "removeLiquidityAndRedeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureLPToken",
        type: "bytes",
      },
    ],
    name: "removeLiquidityAndRedeemWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
    ],
    name: "removeLiquidityAndRepayBorrowAndWithdrawCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureLPToken",
        type: "bytes",
      },
    ],
    name: "removeLiquidityAndRepayBorrowAndWithdrawCollateralWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
    ],
    name: "removeLiquidityAndSellHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureLPToken",
        type: "bytes",
      },
    ],
    name: "removeLiquidityAndSellHTokenWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
    ],
    name: "removeLiquidityAndWithdrawUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureLPToken",
        type: "bytes",
      },
    ],
    name: "removeLiquidityAndWithdrawUnderlyingWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolTokensBurned",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureLPToken",
        type: "bytes",
      },
    ],
    name: "removeLiquidityWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256",
      },
    ],
    name: "repayBorrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHToken",
        name: "hToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureHToken",
        type: "bytes",
      },
    ],
    name: "repayBorrowWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
    ],
    name: "sellHToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "hTokenIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureHToken",
        type: "bytes",
      },
    ],
    name: "sellHTokenWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minHTokenOut",
        type: "uint256",
      },
    ],
    name: "sellUnderlying",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minHTokenOut",
        type: "uint256",
      },
    ],
    name: "sellUnderlyingAndRepayBorrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minHTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "sellUnderlyingAndRepayBorrowWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "underlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minHTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signatureUnderlying",
        type: "bytes",
      },
    ],
    name: "sellUnderlyingWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "collateral",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
    ],
    name: "withdrawCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract WethInterface",
        name: "weth",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
      {
        internalType: "contract IHifiPool",
        name: "hifiPool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minUnderlyingOut",
        type: "uint256",
      },
    ],
    name: "wrapEthAndDepositAndBorrowHTokenAndSellHToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract WethInterface",
        name: "weth",
        type: "address",
      },
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet",
        type: "address",
      },
    ],
    name: "wrapEthAndDepositCollateral",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export class IHifiProxyTarget__factory {
  static readonly abi = _abi;
  static createInterface(): IHifiProxyTargetInterface {
    return new utils.Interface(_abi) as IHifiProxyTargetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IHifiProxyTarget {
    return new Contract(address, _abi, signerOrProvider) as IHifiProxyTarget;
  }
}
