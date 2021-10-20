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

interface HifiPoolRegistryInterface extends ethers.utils.Interface {
  functions: {
    "_renounceOwnership()": FunctionFragment;
    "_transferOwnership(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "pools(address)": FunctionFragment;
    "trackPool(address)": FunctionFragment;
    "untrackPool(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "_renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pools", values: [string]): string;
  encodeFunctionData(functionFragment: "trackPool", values: [string]): string;
  encodeFunctionData(functionFragment: "untrackPool", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "_renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pools", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "trackPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "untrackPool",
    data: BytesLike
  ): Result;

  events: {
    "TrackPool(address)": EventFragment;
    "TransferOwnership(address,address)": EventFragment;
    "UntrackPool(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TrackPool"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferOwnership"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UntrackPool"): EventFragment;
}

export type TrackPoolEvent = TypedEvent<[string] & { pool: string }>;

export type TransferOwnershipEvent = TypedEvent<
  [string, string] & { oldOwner: string; newOwner: string }
>;

export type UntrackPoolEvent = TypedEvent<[string] & { pool: string }>;

export class HifiPoolRegistry extends BaseContract {
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

  interface: HifiPoolRegistryInterface;

  functions: {
    _renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    _transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    pools(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    trackPool(
      pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    untrackPool(
      pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  _renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  _transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  pools(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  trackPool(
    pool: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  untrackPool(
    pool: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _renounceOwnership(overrides?: CallOverrides): Promise<void>;

    _transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    pools(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    trackPool(pool: string, overrides?: CallOverrides): Promise<void>;

    untrackPool(pool: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "TrackPool(address)"(
      pool?: string | null
    ): TypedEventFilter<[string], { pool: string }>;

    TrackPool(
      pool?: string | null
    ): TypedEventFilter<[string], { pool: string }>;

    "TransferOwnership(address,address)"(
      oldOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldOwner: string; newOwner: string }
    >;

    TransferOwnership(
      oldOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { oldOwner: string; newOwner: string }
    >;

    "UntrackPool(address)"(
      pool?: string | null
    ): TypedEventFilter<[string], { pool: string }>;

    UntrackPool(
      pool?: string | null
    ): TypedEventFilter<[string], { pool: string }>;
  };

  estimateGas: {
    _renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    _transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    pools(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    trackPool(
      pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    untrackPool(
      pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    _transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pools(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    trackPool(
      pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    untrackPool(
      pool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}