/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../../common";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export interface IErc20RecoverInterface extends utils.Interface {
  functions: {
    "_recover(address,uint256)": FunctionFragment;
    "_renounceOwnership()": FunctionFragment;
    "_setNonRecoverableTokens(address[])": FunctionFragment;
    "_transferOwnership(address)": FunctionFragment;
    "nonRecoverableTokens(uint256)": FunctionFragment;
    "owner()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_recover"
      | "_renounceOwnership"
      | "_setNonRecoverableTokens"
      | "_transferOwnership"
      | "nonRecoverableTokens"
      | "owner"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_recover",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "_renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_setNonRecoverableTokens",
    values: [string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "_transferOwnership",
    values: [string]
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

  events: {
    "Recover(address,address,uint256)": EventFragment;
    "SetNonRecoverableTokens(address,address[])": EventFragment;
    "TransferOwnership(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Recover"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetNonRecoverableTokens"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferOwnership"): EventFragment;
}

export interface RecoverEventObject {
  owner: string;
  token: string;
  recoverAmount: BigNumber;
}
export type RecoverEvent = TypedEvent<
  [string, string, BigNumber],
  RecoverEventObject
>;

export type RecoverEventFilter = TypedEventFilter<RecoverEvent>;

export interface SetNonRecoverableTokensEventObject {
  owner: string;
  nonRecoverableTokens: string[];
}
export type SetNonRecoverableTokensEvent = TypedEvent<
  [string, string[]],
  SetNonRecoverableTokensEventObject
>;

export type SetNonRecoverableTokensEventFilter =
  TypedEventFilter<SetNonRecoverableTokensEvent>;

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

export interface IErc20Recover extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IErc20RecoverInterface;

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
    _recover(
      token: string,
      recoverAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    _renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    _setNonRecoverableTokens(
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    _transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    nonRecoverableTokens(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;
  };

  _recover(
    token: string,
    recoverAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  _renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  _setNonRecoverableTokens(
    tokens: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  _transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  nonRecoverableTokens(
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    _recover(
      token: string,
      recoverAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    _renounceOwnership(overrides?: CallOverrides): Promise<void>;

    _setNonRecoverableTokens(
      tokens: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    _transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    nonRecoverableTokens(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "Recover(address,address,uint256)"(
      owner?: string | null,
      token?: null,
      recoverAmount?: null
    ): RecoverEventFilter;
    Recover(
      owner?: string | null,
      token?: null,
      recoverAmount?: null
    ): RecoverEventFilter;

    "SetNonRecoverableTokens(address,address[])"(
      owner?: string | null,
      nonRecoverableTokens?: null
    ): SetNonRecoverableTokensEventFilter;
    SetNonRecoverableTokens(
      owner?: string | null,
      nonRecoverableTokens?: null
    ): SetNonRecoverableTokensEventFilter;

    "TransferOwnership(address,address)"(
      oldOwner?: string | null,
      newOwner?: string | null
    ): TransferOwnershipEventFilter;
    TransferOwnership(
      oldOwner?: string | null,
      newOwner?: string | null
    ): TransferOwnershipEventFilter;
  };

  estimateGas: {
    _recover(
      token: string,
      recoverAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    _renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    _setNonRecoverableTokens(
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    _transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    nonRecoverableTokens(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    _recover(
      token: string,
      recoverAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    _renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    _setNonRecoverableTokens(
      tokens: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    _transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    nonRecoverableTokens(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
