/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  SBalanceSheetV1,
  SBalanceSheetV1Interface,
} from "../../../../../../@hifi/protocol/contracts/core/balance-sheet/SBalanceSheetV1";

const _abi = [
  {
    inputs: [],
    name: "fintroller",
    outputs: [
      {
        internalType: "contract IFintroller",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "contract IChainlinkOperator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class SBalanceSheetV1__factory {
  static readonly abi = _abi;
  static createInterface(): SBalanceSheetV1Interface {
    return new utils.Interface(_abi) as SBalanceSheetV1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SBalanceSheetV1 {
    return new Contract(address, _abi, signerOrProvider) as SBalanceSheetV1;
  }
}
