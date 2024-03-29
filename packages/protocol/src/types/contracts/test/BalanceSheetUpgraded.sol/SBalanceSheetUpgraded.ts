/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../common";

export interface SBalanceSheetUpgradedInterface extends utils.Interface {
  functions: {
    "fintroller()": FunctionFragment;
    "lastBlockNumber()": FunctionFragment;
    "oracle()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "fintroller" | "lastBlockNumber" | "oracle"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "fintroller",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastBlockNumber",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;

  decodeFunctionResult(functionFragment: "fintroller", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lastBlockNumber",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;

  events: {};
}

export interface SBalanceSheetUpgraded extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SBalanceSheetUpgradedInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    fintroller(overrides?: CallOverrides): Promise<[string]>;

    lastBlockNumber(overrides?: CallOverrides): Promise<[BigNumber]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;
  };

  fintroller(overrides?: CallOverrides): Promise<string>;

  lastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

  oracle(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    fintroller(overrides?: CallOverrides): Promise<string>;

    lastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    fintroller(overrides?: CallOverrides): Promise<BigNumber>;

    lastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    fintroller(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    lastBlockNumber(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
