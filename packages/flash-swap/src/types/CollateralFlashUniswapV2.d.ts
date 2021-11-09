/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface CollateralFlashUniswapV2Interface extends ethers.utils.Interface {
  functions: {
    "balanceSheet()": FunctionFragment;
    "getRepayCollateralAmount(address,address,uint256)": FunctionFragment;
    "uniV2Factory()": FunctionFragment;
    "uniV2PairInitCodeHash()": FunctionFragment;
    "uniswapV2Call(address,uint256,uint256,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "balanceSheet",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRepayCollateralAmount",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "uniV2Factory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "uniV2PairInitCodeHash",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "uniswapV2Call",
    values: [string, BigNumberish, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "balanceSheet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRepayCollateralAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniV2Factory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniV2PairInitCodeHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV2Call",
    data: BytesLike
  ): Result;

  events: {
    "FlashSwapCollateralAndLiquidateBorrow(address,address,address,uint256,uint256,uint256,uint256,uint256)": EventFragment;
  };

  getEvent(
    nameOrSignatureOrTopic: "FlashSwapCollateralAndLiquidateBorrow"
  ): EventFragment;
}

export type FlashSwapCollateralAndLiquidateBorrowEvent = TypedEvent<
  [
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    liquidator: string;
    borrower: string;
    bond: string;
    underlyingAmount: BigNumber;
    seizeCollateralAmount: BigNumber;
    repayCollateralAmount: BigNumber;
    subsidyCollateralAmount: BigNumber;
    profitCollateralAmount: BigNumber;
  }
>;

export class CollateralFlashUniswapV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: CollateralFlashUniswapV2Interface;

  functions: {
    balanceSheet(overrides?: CallOverrides): Promise<[string]>;

    getRepayCollateralAmount(
      pair: string,
      underlying: string,
      underlyingAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { repayCollateralAmount: BigNumber }>;

    uniV2Factory(overrides?: CallOverrides): Promise<[string]>;

    uniV2PairInitCodeHash(overrides?: CallOverrides): Promise<[string]>;

    uniswapV2Call(
      sender: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  balanceSheet(overrides?: CallOverrides): Promise<string>;

  getRepayCollateralAmount(
    pair: string,
    underlying: string,
    underlyingAmount: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  uniV2Factory(overrides?: CallOverrides): Promise<string>;

  uniV2PairInitCodeHash(overrides?: CallOverrides): Promise<string>;

  uniswapV2Call(
    sender: string,
    amount0: BigNumberish,
    amount1: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceSheet(overrides?: CallOverrides): Promise<string>;

    getRepayCollateralAmount(
      pair: string,
      underlying: string,
      underlyingAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    uniV2Factory(overrides?: CallOverrides): Promise<string>;

    uniV2PairInitCodeHash(overrides?: CallOverrides): Promise<string>;

    uniswapV2Call(
      sender: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "FlashSwapCollateralAndLiquidateBorrow(address,address,address,uint256,uint256,uint256,uint256,uint256)"(
      liquidator?: string | null,
      borrower?: string | null,
      bond?: string | null,
      underlyingAmount?: null,
      seizeCollateralAmount?: null,
      repayCollateralAmount?: null,
      subsidyCollateralAmount?: null,
      profitCollateralAmount?: null
    ): TypedEventFilter<
      [
        string,
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ],
      {
        liquidator: string;
        borrower: string;
        bond: string;
        underlyingAmount: BigNumber;
        seizeCollateralAmount: BigNumber;
        repayCollateralAmount: BigNumber;
        subsidyCollateralAmount: BigNumber;
        profitCollateralAmount: BigNumber;
      }
    >;

    FlashSwapCollateralAndLiquidateBorrow(
      liquidator?: string | null,
      borrower?: string | null,
      bond?: string | null,
      underlyingAmount?: null,
      seizeCollateralAmount?: null,
      repayCollateralAmount?: null,
      subsidyCollateralAmount?: null,
      profitCollateralAmount?: null
    ): TypedEventFilter<
      [
        string,
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ],
      {
        liquidator: string;
        borrower: string;
        bond: string;
        underlyingAmount: BigNumber;
        seizeCollateralAmount: BigNumber;
        repayCollateralAmount: BigNumber;
        subsidyCollateralAmount: BigNumber;
        profitCollateralAmount: BigNumber;
      }
    >;
  };

  estimateGas: {
    balanceSheet(overrides?: CallOverrides): Promise<BigNumber>;

    getRepayCollateralAmount(
      pair: string,
      underlying: string,
      underlyingAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    uniV2Factory(overrides?: CallOverrides): Promise<BigNumber>;

    uniV2PairInitCodeHash(overrides?: CallOverrides): Promise<BigNumber>;

    uniswapV2Call(
      sender: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceSheet(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRepayCollateralAmount(
      pair: string,
      underlying: string,
      underlyingAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    uniV2Factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    uniV2PairInitCodeHash(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    uniswapV2Call(
      sender: string,
      amount0: BigNumberish,
      amount1: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
