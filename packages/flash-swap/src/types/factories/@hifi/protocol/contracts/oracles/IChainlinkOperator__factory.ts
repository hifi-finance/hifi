/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  IChainlinkOperator,
  IChainlinkOperatorInterface,
} from "../../../../../@hifi/protocol/contracts/oracles/IChainlinkOperator";
import type { Provider } from "@ethersproject/providers";
import { Contract, Signer, utils } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
    ],
    name: "ChainlinkOperator__DecimalsMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "ChainlinkOperator__FeedNotSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "ChainlinkOperator__PriceZero",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IErc20",
        name: "asset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IAggregatorV3",
        name: "feed",
        type: "address",
      },
    ],
    name: "DeleteFeed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IErc20",
        name: "asset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract IAggregatorV3",
        name: "feed",
        type: "address",
      },
    ],
    name: "SetFeed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "deleteFeed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "getFeed",
    outputs: [
      {
        internalType: "contract IErc20",
        name: "",
        type: "address",
      },
      {
        internalType: "contract IAggregatorV3",
        name: "",
        type: "address",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "getNormalizedPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pricePrecision",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pricePrecisionScalar",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IErc20",
        name: "asset",
        type: "address",
      },
      {
        internalType: "contract IAggregatorV3",
        name: "feed",
        type: "address",
      },
    ],
    name: "setFeed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IChainlinkOperator__factory {
  static readonly abi = _abi;
  static createInterface(): IChainlinkOperatorInterface {
    return new utils.Interface(_abi) as IChainlinkOperatorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IChainlinkOperator {
    return new Contract(address, _abi, signerOrProvider) as IChainlinkOperator;
  }
}
