/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  YieldSpaceMock,
  YieldSpaceMockInterface,
} from "../../../contracts/test/YieldSpaceMock";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__Exp2InputTooBig",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__FromUintOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__LogInputTooSmall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivFixedPointOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "startingReservesFactor",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newNormalizedUnderlyingReservesFactor",
        type: "uint256",
      },
    ],
    name: "YieldSpace__HTokenOutForUnderlyingInReservesFactorsUnderflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hTokenReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenIn",
        type: "uint256",
      },
    ],
    name: "YieldSpace__HTokenReservesOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hTokenReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
    ],
    name: "YieldSpace__HTokenReservesUnderflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minuend",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "subtrahend",
        type: "uint256",
      },
    ],
    name: "YieldSpace__LossyPrecisionUnderflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timeToMaturity",
        type: "uint256",
      },
    ],
    name: "YieldSpace__TooFarFromMaturity",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "startingReservesFactor",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newHTokenReservesFactor",
        type: "uint256",
      },
    ],
    name: "YieldSpace__UnderlyingOutForHTokenInReservesFactorsUnderflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "normalizedUnderlyingReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "normalizedUnderlyingIn",
        type: "uint256",
      },
    ],
    name: "YieldSpace__UnderlyingReservesOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "normalizedUnderlyingReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "normalizedUnderlyingOut",
        type: "uint256",
      },
    ],
    name: "YieldSpace__UnderlyingReservesUnderflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timeToMaturity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "g",
        type: "uint256",
      },
    ],
    name: "doGetYieldExponent",
    outputs: [
      {
        internalType: "uint256",
        name: "a",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "normalizedUnderlyingReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "normalizedUnderlyingOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeToMaturity",
        type: "uint256",
      },
    ],
    name: "doHTokenInForUnderlyingOut",
    outputs: [
      {
        internalType: "uint256",
        name: "hTokenIn",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "normalizedUnderlyingReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "normalizedUnderlyingIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeToMaturity",
        type: "uint256",
      },
    ],
    name: "doHTokenOutForUnderlyingIn",
    outputs: [
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hTokenReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "normalizedUnderlyingReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeToMaturity",
        type: "uint256",
      },
    ],
    name: "doUnderlyingInForHTokenOut",
    outputs: [
      {
        internalType: "uint256",
        name: "normalizedUnderlyingIn",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hTokenReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "normalizedUnderlyingReserves",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "hTokenIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeToMaturity",
        type: "uint256",
      },
    ],
    name: "doUnderlyingOutForHTokenIn",
    outputs: [
      {
        internalType: "uint256",
        name: "normalizedUnderlyingOut",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610fa8806100206000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c806342e2a8c51161005057806342e2a8c5146100a457806343bdb67b146100b757806376ee71c9146100ca57600080fd5b80630afa51ae1461006c57806320175e0e14610091575b600080fd5b61007f61007a366004610ee4565b6100dd565b60405190815260200160405180910390f35b61007f61009f366004610ee4565b6100f4565b61007f6100b2366004610f16565b610102565b61007f6100c5366004610ee4565b610115565b61007f6100d8366004610ee4565b610123565b60006100eb85858585610131565b95945050505050565b60006100eb8585858561023f565b600061010e838361030d565b9392505050565b60006100eb85858585610377565b60006100eb858585856103b3565b60008061014e6101408461044d565b670d2f13f7789f000061030d565b9050858401808711156101835760405163391238d760e11b815260048101889052602481018690526044015b60405180910390fd5b6000610198836101928961044d565b9061049a565b6101a5846101928b61044d565b01905060006101b7846101928561044d565b9050808210156101e45760405163131e911560e31b8152600481018390526024810182905260440161017a565b60006102036101fe6101f5876104df565b8486039061049a565b610506565b9050808910156102305760405163baee485760e01b8152600481018a90526024810182905260440161017a565b90970398975050505050505050565b60008061025c61024e8461044d565b670e9bb2d80e8435e561030d565b90508386101561028957604051639a56843160e01b8152600481018790526024810185905260440161017a565b838603600061029b836101928461044d565b6102a8846101928a61044d565b6102b5856101928c61044d565b0103905060006102d16101fe6102ca866104df565b849061049a565b9050878110156102fe5760405163baee485760e01b8152600481018290526024810189905260440161017a565b96909603979650505050505050565b6000610325670de0b6b3a7640000630724907f610f4e565b83111561034857604051630e1708e760e01b81526004810184905260240161017a565b60006103596401d88341bc85610517565b90506103658382610517565b670de0b6b3a764000003949350505050565b6000806103866101408461044d565b90508386101561028957604051630195979d60e31b8152600481018790526024810185905260440161017a565b6000806103c261024e8461044d565b9050858401868110156103f2576040516353d5011760e11b8152600481018890526024810186905260440161017a565b6000610401836101928961044d565b61040e846101928b61044d565b0190506000610420846101928561044d565b9050808210156101e4576040516305ef776760e01b8152600481018390526024810182905260440161017a565b60007812725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f2182111561048c57604051633492ffd960e01b81526004810183905260240161017a565b50670de0b6b3a76400000290565b6000826104bf5781156104ae5760006104b8565b670de0b6b3a76400005b90506104d9565b61010e6104d46104ce85610523565b84610517565b6105d3565b92915050565b6000816ec097ce7bc90715b34b9f1000000000816104ff576104ff610f6d565b0492915050565b6000670de0b6b3a7640000826104ff565b600061010e8383610619565b6000670de0b6b3a764000082101561055157604051633621413760e21b81526004810183905260240161017a565b6000610566670de0b6b3a764000084046106db565b670de0b6b3a7640000808202935090915083821c90811415610589575050919050565b6706f05b59d3b200005b80156105cb57670de0b6b3a7640000828002049150671bc16d674ec8000082106105c3579283019260019190911c905b60011c610593565b505050919050565b6000680a688906bd8b000000821061060157604051634a4f26f160e01b81526004810183905260240161017a565b670de0b6b3a7640000604083901b0461010e816107d4565b60008080600019848609848602925082811083820303915050670de0b6b3a7640000811061065d5760405163698d9a0160e11b81526004810182905260240161017a565b600080670de0b6b3a76400008688099150506706f05b59d3b1ffff8111826106975780670de0b6b3a76400008504019450505050506104d9565b620400008285030493909111909103600160ee1b02919091177faccb18165bd6fe31ae1cf318dc5b51eee0e1ba569b88cd74c1773b91fac106690201905092915050565b6000700100000000000000000000000000000000821061070857608091821c916107059082610f83565b90505b68010000000000000000821061072b57604091821c916107289082610f83565b90505b640100000000821061074a57602091821c916107479082610f83565b90505b62010000821061076757601091821c916107649082610f83565b90505b610100821061078357600891821c916107809082610f83565b90505b6010821061079e57600491821c9161079b9082610f83565b90505b600482106107b957600291821c916107b69082610f83565b90505b600282106107cf576107cc600182610f83565b90505b919050565b7780000000000000000000000000000000000000000000000067800000000000000082161561080c5768016a09e667f3bcc9090260401c5b67400000000000000082161561082b576801306fe0a31b7152df0260401c5b67200000000000000082161561084a576801172b83c7d517adce0260401c5b6710000000000000008216156108695768010b5586cf9890f62a0260401c5b670800000000000000821615610888576801059b0d31585743ae0260401c5b6704000000000000008216156108a757680102c9a3e778060ee70260401c5b6702000000000000008216156108c65768010163da9fb33356d80260401c5b6701000000000000008216156108e557680100b1afa5abcbed610260401c5b66800000000000008216156109035768010058c86da1c09ea20260401c5b6640000000000000821615610921576801002c605e2e8cec500260401c5b662000000000000082161561093f57680100162f3904051fa10260401c5b661000000000000082161561095d576801000b175effdc76ba0260401c5b660800000000000082161561097b57680100058ba01fb9f96d0260401c5b66040000000000008216156109995768010002c5cc37da94920260401c5b66020000000000008216156109b7576801000162e525ee05470260401c5b66010000000000008216156109d55768010000b17255775c040260401c5b658000000000008216156109f2576801000058b91b5bc9ae0260401c5b65400000000000821615610a0f57680100002c5c89d5ec6d0260401c5b65200000000000821615610a2c5768010000162e43f4f8310260401c5b65100000000000821615610a4957680100000b1721bcfc9a0260401c5b65080000000000821615610a665768010000058b90cf1e6e0260401c5b65040000000000821615610a83576801000002c5c863b73f0260401c5b65020000000000821615610aa057680100000162e430e5a20260401c5b65010000000000821615610abd576801000000b1721835510260401c5b648000000000821615610ad957680100000058b90c0b490260401c5b644000000000821615610af55768010000002c5c8601cc0260401c5b642000000000821615610b11576801000000162e42fff00260401c5b641000000000821615610b2d5768010000000b17217fbb0260401c5b640800000000821615610b49576801000000058b90bfce0260401c5b640400000000821615610b6557680100000002c5c85fe30260401c5b640200000000821615610b815768010000000162e42ff10260401c5b640100000000821615610b9d57680100000000b17217f80260401c5b6380000000821615610bb85768010000000058b90bfc0260401c5b6340000000821615610bd3576801000000002c5c85fe0260401c5b6320000000821615610bee57680100000000162e42ff0260401c5b6310000000821615610c09576801000000000b17217f0260401c5b6308000000821615610c2457680100000000058b90c00260401c5b6304000000821615610c3f5768010000000002c5c8600260401c5b6302000000821615610c5a576801000000000162e4300260401c5b6301000000821615610c755768010000000000b172180260401c5b62800000821615610c8f576801000000000058b90c0260401c5b62400000821615610ca957680100000000002c5c860260401c5b62200000821615610cc35768010000000000162e430260401c5b62100000821615610cdd57680100000000000b17210260401c5b62080000821615610cf75768010000000000058b910260401c5b62040000821615610d11576801000000000002c5c80260401c5b62020000821615610d2b57680100000000000162e40260401c5b62010000821615610d45576801000000000000b1720260401c5b618000821615610d5e57680100000000000058b90260401c5b614000821615610d775768010000000000002c5d0260401c5b612000821615610d90576801000000000000162e0260401c5b611000821615610da95768010000000000000b170260401c5b610800821615610dc2576801000000000000058c0260401c5b610400821615610ddb57680100000000000002c60260401c5b610200821615610df457680100000000000001630260401c5b610100821615610e0d57680100000000000000b10260401c5b6080821615610e2557680100000000000000590260401c5b6040821615610e3d576801000000000000002c0260401c5b6020821615610e5557680100000000000000160260401c5b6010821615610e6d576801000000000000000b0260401c5b6008821615610e8557680100000000000000060260401c5b6004821615610e9d57680100000000000000030260401c5b6002821615610eb557680100000000000000010260401c5b6001821615610ecd57680100000000000000010260401c5b670de0b6b3a76400000260409190911c60bf031c90565b60008060008060808587031215610efa57600080fd5b5050823594602084013594506040840135936060013592509050565b60008060408385031215610f2957600080fd5b50508035926020909101359150565b634e487b7160e01b600052601160045260246000fd5b6000816000190483118215151615610f6857610f68610f38565b500290565b634e487b7160e01b600052601260045260246000fd5b60008219821115610f9657610f96610f38565b50019056fea164736f6c634300080c000a";

type YieldSpaceMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: YieldSpaceMockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class YieldSpaceMock__factory extends ContractFactory {
  constructor(...args: YieldSpaceMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      YieldSpaceMock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): YieldSpaceMock__factory {
    return super.connect(runner) as YieldSpaceMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): YieldSpaceMockInterface {
    return new Interface(_abi) as YieldSpaceMockInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): YieldSpaceMock {
    return new Contract(address, _abi, runner) as unknown as YieldSpaceMock;
  }
}
