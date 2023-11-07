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

export interface GodModeHTokenInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "DOMAIN_SEPARATOR"
      | "PERMIT_TYPEHASH"
      | "__godMode_mint"
      | "__godMode_setMaturity"
      | "__godMode_setTotalUnderlyingReserve"
      | "__godMode_setUnderlyingPrecisionScalar"
      | "_recover"
      | "_renounceOwnership"
      | "_setBalanceSheet"
      | "_setNonRecoverableTokens"
      | "_transferOwnership"
      | "allowance"
      | "approve"
      | "balanceOf"
      | "balanceSheet"
      | "burn"
      | "decimals"
      | "decreaseAllowance"
      | "depositUnderlying"
      | "fintroller"
      | "getDepositorBalance"
      | "increaseAllowance"
      | "isMatured"
      | "maturity"
      | "mint"
      | "name"
      | "nonRecoverableTokens"
      | "nonces"
      | "owner"
      | "permit"
      | "redeem"
      | "symbol"
      | "totalSupply"
      | "totalUnderlyingReserve"
      | "transfer"
      | "transferFrom"
      | "underlying"
      | "underlyingPrecisionScalar"
      | "version"
      | "withdrawUnderlying"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Approval"
      | "Burn"
      | "DepositUnderlying"
      | "Mint"
      | "Recover"
      | "Redeem"
      | "SetBalanceSheet"
      | "SetNonRecoverableTokens"
      | "Transfer"
      | "TransferOwnership"
      | "WithdrawUnderlying"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "DOMAIN_SEPARATOR",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PERMIT_TYPEHASH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "__godMode_mint",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "__godMode_setMaturity",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "__godMode_setTotalUnderlyingReserve",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "__godMode_setUnderlyingPrecisionScalar",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "_recover",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "_renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_setBalanceSheet",
    values: [AddressLike]
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
    functionFragment: "allowance",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceSheet",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "burn",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "decreaseAllowance",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositUnderlying",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "fintroller",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositorBalance",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "increaseAllowance",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "isMatured", values?: undefined): string;
  encodeFunctionData(functionFragment: "maturity", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nonRecoverableTokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "nonces", values: [AddressLike]): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "permit",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalUnderlyingReserve",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "underlying",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "underlyingPrecisionScalar",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdrawUnderlying",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "DOMAIN_SEPARATOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PERMIT_TYPEHASH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__godMode_mint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__godMode_setMaturity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__godMode_setTotalUnderlyingReserve",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__godMode_setUnderlyingPrecisionScalar",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "_recover", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_setBalanceSheet",
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
  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "balanceSheet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "decreaseAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositUnderlying",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fintroller", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDepositorBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "increaseAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isMatured", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "maturity", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "nonRecoverableTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "nonces", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "permit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalUnderlyingReserve",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "underlying", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "underlyingPrecisionScalar",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawUnderlying",
    data: BytesLike
  ): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [
    owner: AddressLike,
    spender: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [owner: string, spender: string, amount: bigint];
  export interface OutputObject {
    owner: string;
    spender: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BurnEvent {
  export type InputTuple = [holder: AddressLike, burnAmount: BigNumberish];
  export type OutputTuple = [holder: string, burnAmount: bigint];
  export interface OutputObject {
    holder: string;
    burnAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DepositUnderlyingEvent {
  export type InputTuple = [
    depositor: AddressLike,
    depositUnderlyingAmount: BigNumberish,
    hTokenAmount: BigNumberish
  ];
  export type OutputTuple = [
    depositor: string,
    depositUnderlyingAmount: bigint,
    hTokenAmount: bigint
  ];
  export interface OutputObject {
    depositor: string;
    depositUnderlyingAmount: bigint;
    hTokenAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace MintEvent {
  export type InputTuple = [beneficiary: AddressLike, mintAmount: BigNumberish];
  export type OutputTuple = [beneficiary: string, mintAmount: bigint];
  export interface OutputObject {
    beneficiary: string;
    mintAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
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

export namespace RedeemEvent {
  export type InputTuple = [
    account: AddressLike,
    underlyingAmount: BigNumberish,
    hTokenAmount: BigNumberish
  ];
  export type OutputTuple = [
    account: string,
    underlyingAmount: bigint,
    hTokenAmount: bigint
  ];
  export interface OutputObject {
    account: string;
    underlyingAmount: bigint;
    hTokenAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetBalanceSheetEvent {
  export type InputTuple = [
    owner: AddressLike,
    oldBalanceSheet: AddressLike,
    newBalanceSheet: AddressLike
  ];
  export type OutputTuple = [
    owner: string,
    oldBalanceSheet: string,
    newBalanceSheet: string
  ];
  export interface OutputObject {
    owner: string;
    oldBalanceSheet: string;
    newBalanceSheet: string;
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

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, amount: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    amount: bigint;
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

export namespace WithdrawUnderlyingEvent {
  export type InputTuple = [
    depositor: AddressLike,
    underlyingAmount: BigNumberish,
    hTokenAmount: BigNumberish
  ];
  export type OutputTuple = [
    depositor: string,
    underlyingAmount: bigint,
    hTokenAmount: bigint
  ];
  export interface OutputObject {
    depositor: string;
    underlyingAmount: bigint;
    hTokenAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface GodModeHToken extends BaseContract {
  connect(runner?: ContractRunner | null): GodModeHToken;
  waitForDeployment(): Promise<this>;

  interface: GodModeHTokenInterface;

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

  DOMAIN_SEPARATOR: TypedContractMethod<[], [string], "view">;

  PERMIT_TYPEHASH: TypedContractMethod<[], [string], "view">;

  __godMode_mint: TypedContractMethod<
    [beneficiary: AddressLike, mintAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  __godMode_setMaturity: TypedContractMethod<
    [newMaturity: BigNumberish],
    [void],
    "nonpayable"
  >;

  __godMode_setTotalUnderlyingReserve: TypedContractMethod<
    [newTotalUnderlyingReserve: BigNumberish],
    [void],
    "nonpayable"
  >;

  __godMode_setUnderlyingPrecisionScalar: TypedContractMethod<
    [newUnderlyingPrecisionScalar: BigNumberish],
    [void],
    "nonpayable"
  >;

  _recover: TypedContractMethod<
    [token: AddressLike, recoverAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  _renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  _setBalanceSheet: TypedContractMethod<
    [newBalanceSheet: AddressLike],
    [void],
    "nonpayable"
  >;

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

  allowance: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;

  approve: TypedContractMethod<
    [spender: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;

  balanceSheet: TypedContractMethod<[], [string], "view">;

  burn: TypedContractMethod<
    [holder: AddressLike, burnAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  decimals: TypedContractMethod<[], [bigint], "view">;

  decreaseAllowance: TypedContractMethod<
    [spender: AddressLike, subtractedAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  depositUnderlying: TypedContractMethod<
    [underlyingAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  fintroller: TypedContractMethod<[], [string], "view">;

  getDepositorBalance: TypedContractMethod<
    [depositor: AddressLike],
    [bigint],
    "view"
  >;

  increaseAllowance: TypedContractMethod<
    [spender: AddressLike, addedAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  isMatured: TypedContractMethod<[], [boolean], "view">;

  maturity: TypedContractMethod<[], [bigint], "view">;

  mint: TypedContractMethod<
    [beneficiary: AddressLike, mintAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  name: TypedContractMethod<[], [string], "view">;

  nonRecoverableTokens: TypedContractMethod<
    [arg0: BigNumberish],
    [string],
    "view"
  >;

  nonces: TypedContractMethod<[arg0: AddressLike], [bigint], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  permit: TypedContractMethod<
    [
      owner: AddressLike,
      spender: AddressLike,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  redeem: TypedContractMethod<
    [underlyingAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  symbol: TypedContractMethod<[], [string], "view">;

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  totalUnderlyingReserve: TypedContractMethod<[], [bigint], "view">;

  transfer: TypedContractMethod<
    [recipient: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  transferFrom: TypedContractMethod<
    [sender: AddressLike, recipient: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;

  underlying: TypedContractMethod<[], [string], "view">;

  underlyingPrecisionScalar: TypedContractMethod<[], [bigint], "view">;

  version: TypedContractMethod<[], [string], "view">;

  withdrawUnderlying: TypedContractMethod<
    [underlyingAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "DOMAIN_SEPARATOR"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "PERMIT_TYPEHASH"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "__godMode_mint"
  ): TypedContractMethod<
    [beneficiary: AddressLike, mintAmount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "__godMode_setMaturity"
  ): TypedContractMethod<[newMaturity: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "__godMode_setTotalUnderlyingReserve"
  ): TypedContractMethod<
    [newTotalUnderlyingReserve: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "__godMode_setUnderlyingPrecisionScalar"
  ): TypedContractMethod<
    [newUnderlyingPrecisionScalar: BigNumberish],
    [void],
    "nonpayable"
  >;
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
    nameOrSignature: "_setBalanceSheet"
  ): TypedContractMethod<[newBalanceSheet: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "_setNonRecoverableTokens"
  ): TypedContractMethod<[tokens: AddressLike[]], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "_transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "allowance"
  ): TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "approve"
  ): TypedContractMethod<
    [spender: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "balanceSheet"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "burn"
  ): TypedContractMethod<
    [holder: AddressLike, burnAmount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "decimals"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "decreaseAllowance"
  ): TypedContractMethod<
    [spender: AddressLike, subtractedAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "depositUnderlying"
  ): TypedContractMethod<
    [underlyingAmount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "fintroller"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getDepositorBalance"
  ): TypedContractMethod<[depositor: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "increaseAllowance"
  ): TypedContractMethod<
    [spender: AddressLike, addedAmount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "isMatured"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "maturity"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "mint"
  ): TypedContractMethod<
    [beneficiary: AddressLike, mintAmount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "nonRecoverableTokens"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "nonces"
  ): TypedContractMethod<[arg0: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "permit"
  ): TypedContractMethod<
    [
      owner: AddressLike,
      spender: AddressLike,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "redeem"
  ): TypedContractMethod<
    [underlyingAmount: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "totalUnderlyingReserve"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transfer"
  ): TypedContractMethod<
    [recipient: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [sender: AddressLike, recipient: AddressLike, amount: BigNumberish],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "underlying"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "underlyingPrecisionScalar"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "version"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "withdrawUnderlying"
  ): TypedContractMethod<
    [underlyingAmount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "Approval"
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: "Burn"
  ): TypedContractEvent<
    BurnEvent.InputTuple,
    BurnEvent.OutputTuple,
    BurnEvent.OutputObject
  >;
  getEvent(
    key: "DepositUnderlying"
  ): TypedContractEvent<
    DepositUnderlyingEvent.InputTuple,
    DepositUnderlyingEvent.OutputTuple,
    DepositUnderlyingEvent.OutputObject
  >;
  getEvent(
    key: "Mint"
  ): TypedContractEvent<
    MintEvent.InputTuple,
    MintEvent.OutputTuple,
    MintEvent.OutputObject
  >;
  getEvent(
    key: "Recover"
  ): TypedContractEvent<
    RecoverEvent.InputTuple,
    RecoverEvent.OutputTuple,
    RecoverEvent.OutputObject
  >;
  getEvent(
    key: "Redeem"
  ): TypedContractEvent<
    RedeemEvent.InputTuple,
    RedeemEvent.OutputTuple,
    RedeemEvent.OutputObject
  >;
  getEvent(
    key: "SetBalanceSheet"
  ): TypedContractEvent<
    SetBalanceSheetEvent.InputTuple,
    SetBalanceSheetEvent.OutputTuple,
    SetBalanceSheetEvent.OutputObject
  >;
  getEvent(
    key: "SetNonRecoverableTokens"
  ): TypedContractEvent<
    SetNonRecoverableTokensEvent.InputTuple,
    SetNonRecoverableTokensEvent.OutputTuple,
    SetNonRecoverableTokensEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;
  getEvent(
    key: "TransferOwnership"
  ): TypedContractEvent<
    TransferOwnershipEvent.InputTuple,
    TransferOwnershipEvent.OutputTuple,
    TransferOwnershipEvent.OutputObject
  >;
  getEvent(
    key: "WithdrawUnderlying"
  ): TypedContractEvent<
    WithdrawUnderlyingEvent.InputTuple,
    WithdrawUnderlyingEvent.OutputTuple,
    WithdrawUnderlyingEvent.OutputObject
  >;

  filters: {
    "Approval(address,address,uint256)": TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    "Burn(address,uint256)": TypedContractEvent<
      BurnEvent.InputTuple,
      BurnEvent.OutputTuple,
      BurnEvent.OutputObject
    >;
    Burn: TypedContractEvent<
      BurnEvent.InputTuple,
      BurnEvent.OutputTuple,
      BurnEvent.OutputObject
    >;

    "DepositUnderlying(address,uint256,uint256)": TypedContractEvent<
      DepositUnderlyingEvent.InputTuple,
      DepositUnderlyingEvent.OutputTuple,
      DepositUnderlyingEvent.OutputObject
    >;
    DepositUnderlying: TypedContractEvent<
      DepositUnderlyingEvent.InputTuple,
      DepositUnderlyingEvent.OutputTuple,
      DepositUnderlyingEvent.OutputObject
    >;

    "Mint(address,uint256)": TypedContractEvent<
      MintEvent.InputTuple,
      MintEvent.OutputTuple,
      MintEvent.OutputObject
    >;
    Mint: TypedContractEvent<
      MintEvent.InputTuple,
      MintEvent.OutputTuple,
      MintEvent.OutputObject
    >;

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

    "Redeem(address,uint256,uint256)": TypedContractEvent<
      RedeemEvent.InputTuple,
      RedeemEvent.OutputTuple,
      RedeemEvent.OutputObject
    >;
    Redeem: TypedContractEvent<
      RedeemEvent.InputTuple,
      RedeemEvent.OutputTuple,
      RedeemEvent.OutputObject
    >;

    "SetBalanceSheet(address,address,address)": TypedContractEvent<
      SetBalanceSheetEvent.InputTuple,
      SetBalanceSheetEvent.OutputTuple,
      SetBalanceSheetEvent.OutputObject
    >;
    SetBalanceSheet: TypedContractEvent<
      SetBalanceSheetEvent.InputTuple,
      SetBalanceSheetEvent.OutputTuple,
      SetBalanceSheetEvent.OutputObject
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

    "Transfer(address,address,uint256)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
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

    "WithdrawUnderlying(address,uint256,uint256)": TypedContractEvent<
      WithdrawUnderlyingEvent.InputTuple,
      WithdrawUnderlyingEvent.OutputTuple,
      WithdrawUnderlyingEvent.OutputObject
    >;
    WithdrawUnderlying: TypedContractEvent<
      WithdrawUnderlyingEvent.InputTuple,
      WithdrawUnderlyingEvent.OutputTuple,
      WithdrawUnderlyingEvent.OutputObject
    >;
  };
}
