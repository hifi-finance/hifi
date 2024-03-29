/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface BalanceSheetUpgradedInterface extends utils.Interface {
  functions: {
    "_renounceOwnership()": FunctionFragment;
    "_transferOwnership(address)": FunctionFragment;
    "fintroller()": FunctionFragment;
    "getLastBlockNumber()": FunctionFragment;
    "lastBlockNumber()": FunctionFragment;
    "oracle()": FunctionFragment;
    "owner()": FunctionFragment;
    "setLastBlockNumber()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_renounceOwnership"
      | "_transferOwnership"
      | "fintroller"
      | "getLastBlockNumber"
      | "lastBlockNumber"
      | "oracle"
      | "owner"
      | "setLastBlockNumber"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "fintroller",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLastBlockNumber",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastBlockNumber",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setLastBlockNumber",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "_renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fintroller", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getLastBlockNumber",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastBlockNumber",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setLastBlockNumber",
    data: BytesLike
  ): Result;

  events: {
    "TransferOwnership(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TransferOwnership"): EventFragment;
}

export interface TransferOwnershipEventObject {
  oldOwner: string;
  newOwner: string;
}
export type TransferOwnershipEvent = TypedEvent<
  [string, string],
  TransferOwnershipEventObject
>;

export type TransferOwnershipEventFilter =
  TypedEventFilter<TransferOwnershipEvent>;

export interface BalanceSheetUpgraded extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BalanceSheetUpgradedInterface;

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
    _renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    _transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    fintroller(overrides?: CallOverrides): Promise<[string]>;

    getLastBlockNumber(overrides?: CallOverrides): Promise<[BigNumber]>;

    lastBlockNumber(overrides?: CallOverrides): Promise<[BigNumber]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    setLastBlockNumber(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  _renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  _transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  fintroller(overrides?: CallOverrides): Promise<string>;

  getLastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

  lastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

  oracle(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  setLastBlockNumber(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _renounceOwnership(overrides?: CallOverrides): Promise<void>;

    _transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    fintroller(overrides?: CallOverrides): Promise<string>;

    getLastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

    lastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    setLastBlockNumber(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "TransferOwnership(address,address)"(
      oldOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): TransferOwnershipEventFilter;
    TransferOwnership(
      oldOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): TransferOwnershipEventFilter;
  };

  estimateGas: {
    _renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    _transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    fintroller(overrides?: CallOverrides): Promise<BigNumber>;

    getLastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

    lastBlockNumber(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    setLastBlockNumber(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    _transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    fintroller(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getLastBlockNumber(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lastBlockNumber(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setLastBlockNumber(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
