/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
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
} from "../common";

export interface IHifiPoolRegistryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "_renounceOwnership"
      | "_transferOwnership"
      | "owner"
      | "pools"
      | "trackPool"
      | "untrackPool"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "TrackPool" | "TransferOwnership" | "UntrackPool"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "_renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pools", values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: "trackPool",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "untrackPool",
    values: [AddressLike]
  ): string;

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
}

export namespace TrackPoolEvent {
  export type InputTuple = [pool: AddressLike];
  export type OutputTuple = [pool: string];
  export interface OutputObject {
    pool: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferOwnershipEvent {
  export type InputTuple = [oldOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [oldOwner: string, newOwner: string];
  export interface OutputObject {
    oldOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UntrackPoolEvent {
  export type InputTuple = [pool: AddressLike];
  export type OutputTuple = [pool: string];
  export interface OutputObject {
    pool: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IHifiPoolRegistry extends BaseContract {
  connect(runner?: ContractRunner | null): IHifiPoolRegistry;
  waitForDeployment(): Promise<this>;

  interface: IHifiPoolRegistryInterface;

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

  _renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  _transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  pools: TypedContractMethod<[pool: AddressLike], [boolean], "view">;

  trackPool: TypedContractMethod<[pool: AddressLike], [void], "nonpayable">;

  untrackPool: TypedContractMethod<[pool: AddressLike], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "_transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pools"
  ): TypedContractMethod<[pool: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "trackPool"
  ): TypedContractMethod<[pool: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "untrackPool"
  ): TypedContractMethod<[pool: AddressLike], [void], "nonpayable">;

  getEvent(
    key: "TrackPool"
  ): TypedContractEvent<
    TrackPoolEvent.InputTuple,
    TrackPoolEvent.OutputTuple,
    TrackPoolEvent.OutputObject
  >;
  getEvent(
    key: "TransferOwnership"
  ): TypedContractEvent<
    TransferOwnershipEvent.InputTuple,
    TransferOwnershipEvent.OutputTuple,
    TransferOwnershipEvent.OutputObject
  >;
  getEvent(
    key: "UntrackPool"
  ): TypedContractEvent<
    UntrackPoolEvent.InputTuple,
    UntrackPoolEvent.OutputTuple,
    UntrackPoolEvent.OutputObject
  >;

  filters: {
    "TrackPool(address)": TypedContractEvent<
      TrackPoolEvent.InputTuple,
      TrackPoolEvent.OutputTuple,
      TrackPoolEvent.OutputObject
    >;
    TrackPool: TypedContractEvent<
      TrackPoolEvent.InputTuple,
      TrackPoolEvent.OutputTuple,
      TrackPoolEvent.OutputObject
    >;

    "TransferOwnership(address,address)": TypedContractEvent<
      TransferOwnershipEvent.InputTuple,
      TransferOwnershipEvent.OutputTuple,
      TransferOwnershipEvent.OutputObject
    >;
    TransferOwnership: TypedContractEvent<
      TransferOwnershipEvent.InputTuple,
      TransferOwnershipEvent.OutputTuple,
      TransferOwnershipEvent.OutputObject
    >;

    "UntrackPool(address)": TypedContractEvent<
      UntrackPoolEvent.InputTuple,
      UntrackPoolEvent.OutputTuple,
      UntrackPoolEvent.OutputObject
    >;
    UntrackPool: TypedContractEvent<
      UntrackPoolEvent.InputTuple,
      UntrackPoolEvent.OutputTuple,
      UntrackPoolEvent.OutputObject
    >;
  };
}
