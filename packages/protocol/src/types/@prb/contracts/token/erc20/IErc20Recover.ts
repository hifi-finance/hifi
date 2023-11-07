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
} from "../../../../common";

export interface IErc20RecoverInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "_recover"
      | "_renounceOwnership"
      | "_setNonRecoverableTokens"
      | "_transferOwnership"
      | "nonRecoverableTokens"
      | "owner"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Recover"
      | "SetNonRecoverableTokens"
      | "TransferOwnership"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "_recover",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "_renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_setNonRecoverableTokens",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "_transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "nonRecoverableTokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;

  decodeFunctionResult(functionFragment: "_recover", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setNonRecoverableTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "nonRecoverableTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
}

export namespace RecoverEvent {
  export type InputTuple = [
    owner: AddressLike,
    token: AddressLike,
    recoverAmount: BigNumberish
  ];
  export type OutputTuple = [
    owner: string,
    token: string,
    recoverAmount: bigint
  ];
  export interface OutputObject {
    owner: string;
    token: string;
    recoverAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetNonRecoverableTokensEvent {
  export type InputTuple = [
    owner: AddressLike,
    nonRecoverableTokens: AddressLike[]
  ];
  export type OutputTuple = [owner: string, nonRecoverableTokens: string[]];
  export interface OutputObject {
    owner: string;
    nonRecoverableTokens: string[];
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

export interface IErc20Recover extends BaseContract {
  connect(runner?: ContractRunner | null): IErc20Recover;
  waitForDeployment(): Promise<this>;

  interface: IErc20RecoverInterface;

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

  _recover: TypedContractMethod<
    [token: AddressLike, recoverAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  _renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  _setNonRecoverableTokens: TypedContractMethod<
    [tokens: AddressLike[]],
    [void],
    "nonpayable"
  >;

  _transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  nonRecoverableTokens: TypedContractMethod<
    [index: BigNumberish],
    [string],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_recover"
  ): TypedContractMethod<
    [token: AddressLike, recoverAmount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "_renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "_setNonRecoverableTokens"
  ): TypedContractMethod<[tokens: AddressLike[]], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "_transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "nonRecoverableTokens"
  ): TypedContractMethod<[index: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "Recover"
  ): TypedContractEvent<
    RecoverEvent.InputTuple,
    RecoverEvent.OutputTuple,
    RecoverEvent.OutputObject
  >;
  getEvent(
    key: "SetNonRecoverableTokens"
  ): TypedContractEvent<
    SetNonRecoverableTokensEvent.InputTuple,
    SetNonRecoverableTokensEvent.OutputTuple,
    SetNonRecoverableTokensEvent.OutputObject
  >;
  getEvent(
    key: "TransferOwnership"
  ): TypedContractEvent<
    TransferOwnershipEvent.InputTuple,
    TransferOwnershipEvent.OutputTuple,
    TransferOwnershipEvent.OutputObject
  >;

  filters: {
    "Recover(address,address,uint256)": TypedContractEvent<
      RecoverEvent.InputTuple,
      RecoverEvent.OutputTuple,
      RecoverEvent.OutputObject
    >;
    Recover: TypedContractEvent<
      RecoverEvent.InputTuple,
      RecoverEvent.OutputTuple,
      RecoverEvent.OutputObject
    >;

    "SetNonRecoverableTokens(address,address[])": TypedContractEvent<
      SetNonRecoverableTokensEvent.InputTuple,
      SetNonRecoverableTokensEvent.OutputTuple,
      SetNonRecoverableTokensEvent.OutputObject
    >;
    SetNonRecoverableTokens: TypedContractEvent<
      SetNonRecoverableTokensEvent.InputTuple,
      SetNonRecoverableTokensEvent.OutputTuple,
      SetNonRecoverableTokensEvent.OutputObject
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
  };
}
