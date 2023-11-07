/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export declare namespace IFlashUniswapV3 {
  export type FlashLiquidateParamsStruct = {
    borrower: AddressLike;
    bond: AddressLike;
    collateral: AddressLike;
    poolFee: BigNumberish;
    turnout: BigNumberish;
    underlyingAmount: BigNumberish;
  };

  export type FlashLiquidateParamsStructOutput = [
    borrower: string,
    bond: string,
    collateral: string,
    poolFee: bigint,
    turnout: bigint,
    underlyingAmount: bigint
  ] & {
    borrower: string;
    bond: string;
    collateral: string;
    poolFee: bigint;
    turnout: bigint;
    underlyingAmount: bigint;
  };
}

export interface IFlashUniswapV3Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "balanceSheet"
      | "flashLiquidate"
      | "uniV3Factory"
      | "uniswapV3SwapCallback"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "FlashSwapAndLiquidateBorrow"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "balanceSheet",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "flashLiquidate",
    values: [IFlashUniswapV3.FlashLiquidateParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "uniV3Factory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "uniswapV3SwapCallback",
    values: [BigNumberish, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "balanceSheet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "flashLiquidate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniV3Factory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV3SwapCallback",
    data: BytesLike
  ): Result;
}

export namespace FlashSwapAndLiquidateBorrowEvent {
  export type InputTuple = [
    liquidator: AddressLike,
    borrower: AddressLike,
    bond: AddressLike,
    collateral: AddressLike,
    underlyingAmount: BigNumberish,
    seizeAmount: BigNumberish,
    repayAmount: BigNumberish,
    subsidyAmount: BigNumberish,
    profitAmount: BigNumberish
  ];
  export type OutputTuple = [
    liquidator: string,
    borrower: string,
    bond: string,
    collateral: string,
    underlyingAmount: bigint,
    seizeAmount: bigint,
    repayAmount: bigint,
    subsidyAmount: bigint,
    profitAmount: bigint
  ];
  export interface OutputObject {
    liquidator: string;
    borrower: string;
    bond: string;
    collateral: string;
    underlyingAmount: bigint;
    seizeAmount: bigint;
    repayAmount: bigint;
    subsidyAmount: bigint;
    profitAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IFlashUniswapV3 extends BaseContract {
  connect(runner?: ContractRunner | null): IFlashUniswapV3;
  waitForDeployment(): Promise<this>;

  interface: IFlashUniswapV3Interface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  balanceSheet: TypedContractMethod<[], [string], "view">;

  flashLiquidate: TypedContractMethod<
    [params: IFlashUniswapV3.FlashLiquidateParamsStruct],
    [void],
    "nonpayable"
  >;

  uniV3Factory: TypedContractMethod<[], [string], "view">;

  uniswapV3SwapCallback: TypedContractMethod<
    [amount0Delta: BigNumberish, amount1Delta: BigNumberish, data: BytesLike],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "balanceSheet"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "flashLiquidate"
  ): TypedContractMethod<
    [params: IFlashUniswapV3.FlashLiquidateParamsStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "uniV3Factory"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "uniswapV3SwapCallback"
  ): TypedContractMethod<
    [amount0Delta: BigNumberish, amount1Delta: BigNumberish, data: BytesLike],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "FlashSwapAndLiquidateBorrow"
  ): TypedContractEvent<
    FlashSwapAndLiquidateBorrowEvent.InputTuple,
    FlashSwapAndLiquidateBorrowEvent.OutputTuple,
    FlashSwapAndLiquidateBorrowEvent.OutputObject
  >;

  filters: {
    "FlashSwapAndLiquidateBorrow(address,address,address,address,uint256,uint256,uint256,uint256,uint256)": TypedContractEvent<
      FlashSwapAndLiquidateBorrowEvent.InputTuple,
      FlashSwapAndLiquidateBorrowEvent.OutputTuple,
      FlashSwapAndLiquidateBorrowEvent.OutputObject
    >;
    FlashSwapAndLiquidateBorrow: TypedContractEvent<
      FlashSwapAndLiquidateBorrowEvent.InputTuple,
      FlashSwapAndLiquidateBorrowEvent.OutputTuple,
      FlashSwapAndLiquidateBorrowEvent.OutputObject
    >;
  };
}
