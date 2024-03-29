/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
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

export interface IBalanceSheetV2Interface extends utils.Interface {
  functions: {
    "_renounceOwnership()": FunctionFragment;
    "_transferOwnership(address)": FunctionFragment;
    "borrow(address,uint256)": FunctionFragment;
    "depositCollateral(address,uint256)": FunctionFragment;
    "getBondList(address)": FunctionFragment;
    "getCollateralAmount(address,address)": FunctionFragment;
    "getCollateralList(address)": FunctionFragment;
    "getCurrentAccountLiquidity(address)": FunctionFragment;
    "getDebtAmount(address,address)": FunctionFragment;
    "getHypotheticalAccountLiquidity(address,address,uint256,address,uint256)": FunctionFragment;
    "getRepayAmount(address,uint256,address)": FunctionFragment;
    "getSeizableCollateralAmount(address,uint256,address)": FunctionFragment;
    "liquidateBorrow(address,address,uint256,address)": FunctionFragment;
    "owner()": FunctionFragment;
    "repayBorrow(address,uint256)": FunctionFragment;
    "repayBorrowBehalf(address,address,uint256)": FunctionFragment;
    "setFintroller(address)": FunctionFragment;
    "setOracle(address)": FunctionFragment;
    "withdrawCollateral(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_renounceOwnership"
      | "_transferOwnership"
      | "borrow"
      | "depositCollateral"
      | "getBondList"
      | "getCollateralAmount"
      | "getCollateralList"
      | "getCurrentAccountLiquidity"
      | "getDebtAmount"
      | "getHypotheticalAccountLiquidity"
      | "getRepayAmount"
      | "getSeizableCollateralAmount"
      | "liquidateBorrow"
      | "owner"
      | "repayBorrow"
      | "repayBorrowBehalf"
      | "setFintroller"
      | "setOracle"
      | "withdrawCollateral"
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
    functionFragment: "borrow",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "depositCollateral",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getBondList",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getCollateralAmount",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getCollateralList",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentAccountLiquidity",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDebtAmount",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getHypotheticalAccountLiquidity",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getRepayAmount",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getSeizableCollateralAmount",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "liquidateBorrow",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "repayBorrow",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "repayBorrowBehalf",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setFintroller",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setOracle",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawCollateral",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "_renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "borrow", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBondList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollateralAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollateralList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentAccountLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDebtAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getHypotheticalAccountLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRepayAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSeizableCollateralAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "liquidateBorrow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "repayBorrow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "repayBorrowBehalf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFintroller",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setOracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawCollateral",
    data: BytesLike
  ): Result;

  events: {
    "Borrow(address,address,uint256)": EventFragment;
    "DepositCollateral(address,address,uint256)": EventFragment;
    "LiquidateBorrow(address,address,address,uint256,address,uint256)": EventFragment;
    "RepayBorrow(address,address,address,uint256,uint256)": EventFragment;
    "SetFintroller(address,address,address)": EventFragment;
    "SetOracle(address,address,address)": EventFragment;
    "TransferOwnership(address,address)": EventFragment;
    "WithdrawCollateral(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Borrow"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "DepositCollateral"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LiquidateBorrow"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RepayBorrow"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetFintroller"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetOracle"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferOwnership"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WithdrawCollateral"): EventFragment;
}

export interface BorrowEventObject {
  account: string;
  bond: string;
  borrowAmount: BigNumber;
}
export type BorrowEvent = TypedEvent<
  [string, string, BigNumber],
  BorrowEventObject
>;

export type BorrowEventFilter = TypedEventFilter<BorrowEvent>;

export interface DepositCollateralEventObject {
  account: string;
  collateral: string;
  collateralAmount: BigNumber;
}
export type DepositCollateralEvent = TypedEvent<
  [string, string, BigNumber],
  DepositCollateralEventObject
>;

export type DepositCollateralEventFilter =
  TypedEventFilter<DepositCollateralEvent>;

export interface LiquidateBorrowEventObject {
  liquidator: string;
  borrower: string;
  bond: string;
  repayAmount: BigNumber;
  collateral: string;
  seizedCollateralAmount: BigNumber;
}
export type LiquidateBorrowEvent = TypedEvent<
  [string, string, string, BigNumber, string, BigNumber],
  LiquidateBorrowEventObject
>;

export type LiquidateBorrowEventFilter = TypedEventFilter<LiquidateBorrowEvent>;

export interface RepayBorrowEventObject {
  payer: string;
  borrower: string;
  bond: string;
  repayAmount: BigNumber;
  newDebtAmount: BigNumber;
}
export type RepayBorrowEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber],
  RepayBorrowEventObject
>;

export type RepayBorrowEventFilter = TypedEventFilter<RepayBorrowEvent>;

export interface SetFintrollerEventObject {
  owner: string;
  oldFintroller: string;
  newFintroller: string;
}
export type SetFintrollerEvent = TypedEvent<
  [string, string, string],
  SetFintrollerEventObject
>;

export type SetFintrollerEventFilter = TypedEventFilter<SetFintrollerEvent>;

export interface SetOracleEventObject {
  owner: string;
  oldOracle: string;
  newOracle: string;
}
export type SetOracleEvent = TypedEvent<
  [string, string, string],
  SetOracleEventObject
>;

export type SetOracleEventFilter = TypedEventFilter<SetOracleEvent>;

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

export interface WithdrawCollateralEventObject {
  account: string;
  collateral: string;
  collateralAmount: BigNumber;
}
export type WithdrawCollateralEvent = TypedEvent<
  [string, string, BigNumber],
  WithdrawCollateralEventObject
>;

export type WithdrawCollateralEventFilter =
  TypedEventFilter<WithdrawCollateralEvent>;

export interface IBalanceSheetV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IBalanceSheetV2Interface;

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

    borrow(
      bond: PromiseOrValue<string>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    depositCollateral(
      collateral: PromiseOrValue<string>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getBondList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getCollateralAmount(
      account: PromiseOrValue<string>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { collateralAmount: BigNumber }>;

    getCollateralList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getCurrentAccountLiquidity(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        excessLiquidity: BigNumber;
        shortfallLiquidity: BigNumber;
      }
    >;

    getDebtAmount(
      account: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { debtAmount: BigNumber }>;

    getHypotheticalAccountLiquidity(
      account: PromiseOrValue<string>,
      collateralModify: PromiseOrValue<string>,
      collateralAmountModify: PromiseOrValue<BigNumberish>,
      bondModify: PromiseOrValue<string>,
      debtAmountModify: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        excessLiquidity: BigNumber;
        shortfallLiquidity: BigNumber;
      }
    >;

    getRepayAmount(
      collateral: PromiseOrValue<string>,
      seizableCollateralAmount: PromiseOrValue<BigNumberish>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { repayAmount: BigNumber }>;

    getSeizableCollateralAmount(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { seizableCollateralAmount: BigNumber }>;

    liquidateBorrow(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    repayBorrow(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    repayBorrowBehalf(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setFintroller(
      newFintroller: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setOracle(
      newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    withdrawCollateral(
      collateral: PromiseOrValue<string>,
      withdrawAmount: PromiseOrValue<BigNumberish>,
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

  borrow(
    bond: PromiseOrValue<string>,
    borrowAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  depositCollateral(
    collateral: PromiseOrValue<string>,
    depositAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getBondList(
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getCollateralAmount(
    account: PromiseOrValue<string>,
    collateral: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getCollateralList(
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getCurrentAccountLiquidity(
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & {
      excessLiquidity: BigNumber;
      shortfallLiquidity: BigNumber;
    }
  >;

  getDebtAmount(
    account: PromiseOrValue<string>,
    bond: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getHypotheticalAccountLiquidity(
    account: PromiseOrValue<string>,
    collateralModify: PromiseOrValue<string>,
    collateralAmountModify: PromiseOrValue<BigNumberish>,
    bondModify: PromiseOrValue<string>,
    debtAmountModify: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & {
      excessLiquidity: BigNumber;
      shortfallLiquidity: BigNumber;
    }
  >;

  getRepayAmount(
    collateral: PromiseOrValue<string>,
    seizableCollateralAmount: PromiseOrValue<BigNumberish>,
    bond: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getSeizableCollateralAmount(
    bond: PromiseOrValue<string>,
    repayAmount: PromiseOrValue<BigNumberish>,
    collateral: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  liquidateBorrow(
    borrower: PromiseOrValue<string>,
    bond: PromiseOrValue<string>,
    repayAmount: PromiseOrValue<BigNumberish>,
    collateral: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  repayBorrow(
    bond: PromiseOrValue<string>,
    repayAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  repayBorrowBehalf(
    borrower: PromiseOrValue<string>,
    bond: PromiseOrValue<string>,
    repayAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setFintroller(
    newFintroller: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setOracle(
    newOracle: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  withdrawCollateral(
    collateral: PromiseOrValue<string>,
    withdrawAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _renounceOwnership(overrides?: CallOverrides): Promise<void>;

    _transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    borrow(
      bond: PromiseOrValue<string>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    depositCollateral(
      collateral: PromiseOrValue<string>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getBondList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getCollateralAmount(
      account: PromiseOrValue<string>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCollateralList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getCurrentAccountLiquidity(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        excessLiquidity: BigNumber;
        shortfallLiquidity: BigNumber;
      }
    >;

    getDebtAmount(
      account: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getHypotheticalAccountLiquidity(
      account: PromiseOrValue<string>,
      collateralModify: PromiseOrValue<string>,
      collateralAmountModify: PromiseOrValue<BigNumberish>,
      bondModify: PromiseOrValue<string>,
      debtAmountModify: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        excessLiquidity: BigNumber;
        shortfallLiquidity: BigNumber;
      }
    >;

    getRepayAmount(
      collateral: PromiseOrValue<string>,
      seizableCollateralAmount: PromiseOrValue<BigNumberish>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSeizableCollateralAmount(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    liquidateBorrow(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    repayBorrow(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    repayBorrowBehalf(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setFintroller(
      newFintroller: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setOracle(
      newOracle: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawCollateral(
      collateral: PromiseOrValue<string>,
      withdrawAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "Borrow(address,address,uint256)"(
      account?: PromiseOrValue<string> | null,
      bond?: PromiseOrValue<string> | null,
      borrowAmount?: null
    ): BorrowEventFilter;
    Borrow(
      account?: PromiseOrValue<string> | null,
      bond?: PromiseOrValue<string> | null,
      borrowAmount?: null
    ): BorrowEventFilter;

    "DepositCollateral(address,address,uint256)"(
      account?: PromiseOrValue<string> | null,
      collateral?: PromiseOrValue<string> | null,
      collateralAmount?: null
    ): DepositCollateralEventFilter;
    DepositCollateral(
      account?: PromiseOrValue<string> | null,
      collateral?: PromiseOrValue<string> | null,
      collateralAmount?: null
    ): DepositCollateralEventFilter;

    "LiquidateBorrow(address,address,address,uint256,address,uint256)"(
      liquidator?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      bond?: PromiseOrValue<string> | null,
      repayAmount?: null,
      collateral?: null,
      seizedCollateralAmount?: null
    ): LiquidateBorrowEventFilter;
    LiquidateBorrow(
      liquidator?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      bond?: PromiseOrValue<string> | null,
      repayAmount?: null,
      collateral?: null,
      seizedCollateralAmount?: null
    ): LiquidateBorrowEventFilter;

    "RepayBorrow(address,address,address,uint256,uint256)"(
      payer?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      bond?: PromiseOrValue<string> | null,
      repayAmount?: null,
      newDebtAmount?: null
    ): RepayBorrowEventFilter;
    RepayBorrow(
      payer?: PromiseOrValue<string> | null,
      borrower?: PromiseOrValue<string> | null,
      bond?: PromiseOrValue<string> | null,
      repayAmount?: null,
      newDebtAmount?: null
    ): RepayBorrowEventFilter;

    "SetFintroller(address,address,address)"(
      owner?: PromiseOrValue<string> | null,
      oldFintroller?: null,
      newFintroller?: null
    ): SetFintrollerEventFilter;
    SetFintroller(
      owner?: PromiseOrValue<string> | null,
      oldFintroller?: null,
      newFintroller?: null
    ): SetFintrollerEventFilter;

    "SetOracle(address,address,address)"(
      owner?: PromiseOrValue<string> | null,
      oldOracle?: null,
      newOracle?: null
    ): SetOracleEventFilter;
    SetOracle(
      owner?: PromiseOrValue<string> | null,
      oldOracle?: null,
      newOracle?: null
    ): SetOracleEventFilter;

    "TransferOwnership(address,address)"(
      oldOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): TransferOwnershipEventFilter;
    TransferOwnership(
      oldOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): TransferOwnershipEventFilter;

    "WithdrawCollateral(address,address,uint256)"(
      account?: PromiseOrValue<string> | null,
      collateral?: PromiseOrValue<string> | null,
      collateralAmount?: null
    ): WithdrawCollateralEventFilter;
    WithdrawCollateral(
      account?: PromiseOrValue<string> | null,
      collateral?: PromiseOrValue<string> | null,
      collateralAmount?: null
    ): WithdrawCollateralEventFilter;
  };

  estimateGas: {
    _renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    _transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    borrow(
      bond: PromiseOrValue<string>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    depositCollateral(
      collateral: PromiseOrValue<string>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getBondList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCollateralAmount(
      account: PromiseOrValue<string>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCollateralList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCurrentAccountLiquidity(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getDebtAmount(
      account: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getHypotheticalAccountLiquidity(
      account: PromiseOrValue<string>,
      collateralModify: PromiseOrValue<string>,
      collateralAmountModify: PromiseOrValue<BigNumberish>,
      bondModify: PromiseOrValue<string>,
      debtAmountModify: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRepayAmount(
      collateral: PromiseOrValue<string>,
      seizableCollateralAmount: PromiseOrValue<BigNumberish>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getSeizableCollateralAmount(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    liquidateBorrow(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    repayBorrow(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    repayBorrowBehalf(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setFintroller(
      newFintroller: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setOracle(
      newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    withdrawCollateral(
      collateral: PromiseOrValue<string>,
      withdrawAmount: PromiseOrValue<BigNumberish>,
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

    borrow(
      bond: PromiseOrValue<string>,
      borrowAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    depositCollateral(
      collateral: PromiseOrValue<string>,
      depositAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getBondList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCollateralAmount(
      account: PromiseOrValue<string>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCollateralList(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentAccountLiquidity(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDebtAmount(
      account: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getHypotheticalAccountLiquidity(
      account: PromiseOrValue<string>,
      collateralModify: PromiseOrValue<string>,
      collateralAmountModify: PromiseOrValue<BigNumberish>,
      bondModify: PromiseOrValue<string>,
      debtAmountModify: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRepayAmount(
      collateral: PromiseOrValue<string>,
      seizableCollateralAmount: PromiseOrValue<BigNumberish>,
      bond: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSeizableCollateralAmount(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    liquidateBorrow(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      collateral: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    repayBorrow(
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    repayBorrowBehalf(
      borrower: PromiseOrValue<string>,
      bond: PromiseOrValue<string>,
      repayAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setFintroller(
      newFintroller: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setOracle(
      newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    withdrawCollateral(
      collateral: PromiseOrValue<string>,
      withdrawAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
