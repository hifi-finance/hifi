/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  GodModeErc20,
  GodModeErc20Interface,
} from "../../../contracts/test/GodModeErc20";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Erc20__ApproveOwnerZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "Erc20__ApproveSpenderZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "Erc20__BurnZeroAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Erc20__InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "senderBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Erc20__InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "Erc20__MintZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "Erc20__TransferRecipientZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "Erc20__TransferSenderZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "burnAmount",
        type: "uint256",
      },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256",
      },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "approveAmount",
        type: "uint256",
      },
    ],
    name: "__godMode_approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "burnAmount",
        type: "uint256",
      },
    ],
    name: "__godMode_burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "mintAmount",
        type: "uint256",
      },
    ],
    name: "__godMode_mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedAmount",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedAmount",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a06040523480156200001157600080fd5b5060405162000bfb38038062000bfb8339810160408190526200003491620001eb565b82828282600090805190602001906200004f92919062000078565b5081516200006590600190602085019062000078565b5060ff1660805250620002ad9350505050565b828054620000869062000270565b90600052602060002090601f016020900481019282620000aa5760008555620000f5565b82601f10620000c557805160ff1916838001178555620000f5565b82800160010185558215620000f5579182015b82811115620000f5578251825591602001919060010190620000d8565b506200010392915062000107565b5090565b5b8082111562000103576000815560010162000108565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200014657600080fd5b81516001600160401b03808211156200016357620001636200011e565b604051601f8301601f19908116603f011681019082821181831017156200018e576200018e6200011e565b81604052838152602092508683858801011115620001ab57600080fd5b600091505b83821015620001cf5785820183015181830184015290820190620001b0565b83821115620001e15760008385830101525b9695505050505050565b6000806000606084860312156200020157600080fd5b83516001600160401b03808211156200021957600080fd5b620002278783880162000134565b945060208601519150808211156200023e57600080fd5b506200024d8682870162000134565b925050604084015160ff811681146200026557600080fd5b809150509250925092565b600181811c908216806200028557607f821691505b60208210811415620002a757634e487b7160e01b600052602260045260246000fd5b50919050565b608051610932620002c9600039600061015f01526109326000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c8063836b452a1161008c578063a9059cbb11610066578063a9059cbb146101ff578063ca93ec2214610212578063dd62ed3e14610225578063e995dda01461025e57600080fd5b8063836b452a146101cf57806395d89b41146101e4578063a457c2d7146101ec57600080fd5b806323b872dd116100c857806323b872dd14610147578063313ce5671461015a578063395093511461019357806370a08231146101a657600080fd5b806306fdde03146100ef578063095ea7b31461010d57806318160ddd14610130575b600080fd5b6100f7610271565b6040516101049190610779565b60405180910390f35b61012061011b3660046107ea565b6102ff565b6040519015158152602001610104565b61013960025481565b604051908152602001610104565b610120610155366004610814565b610315565b6101817f000000000000000000000000000000000000000000000000000000000000000081565b60405160ff9091168152602001610104565b6101206101a13660046107ea565b61038e565b6101396101b4366004610850565b6001600160a01b031660009081526003602052604090205490565b6101e26101dd3660046107ea565b6103d6565b005b6100f76103e4565b6101206101fa3660046107ea565b6103f1565b61012061020d3660046107ea565b610422565b6101e2610220366004610814565b61042f565b610139610233366004610872565b6001600160a01b03918216600090815260046020908152604080832093909416825291909152205490565b6101e261026c3660046107ea565b61043f565b6000805461027e906108a5565b80601f01602080910402602001604051908101604052809291908181526020018280546102aa906108a5565b80156102f75780601f106102cc576101008083540402835291602001916102f7565b820191906000526020600020905b8154815290600101906020018083116102da57829003601f168201915b505050505081565b600061030c338484610449565b50600192915050565b60006103228484846104f8565b6001600160a01b03841660009081526004602090815260408083203384529091529020548281101561037657604051632b3ca6f360e11b815260048101829052602481018490526044015b60405180910390fd5b6103838533858403610449565b506001949350505050565b3360009081526004602090815260408083206001600160a01b038616845290915281205481906103bf9084906108f6565b90506103cc338583610449565b5060019392505050565b6103e0828261061b565b5050565b6001805461027e906108a5565b3360009081526004602090815260408083206001600160a01b038616845290915281205481906103bf90849061090e565b600061030c3384846104f8565b61043a838383610449565b505050565b6103e082826106ce565b6001600160a01b0383166104705760405163230326bf60e11b815260040160405180910390fd5b6001600160a01b03821661049757604051630b39ecd960e21b815260040160405180910390fd5b6001600160a01b0383811660008181526004602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03831661051f5760405163907bfbd760e01b815260040160405180910390fd5b6001600160a01b03821661054657604051637184c13f60e01b815260040160405180910390fd5b6001600160a01b0383166000908152600360205260409020548181101561058a57604051632dcf2e2160e21b8152600481018290526024810183905260440161036d565b6001600160a01b038085166000908152600360205260408082208585039055918516815290812080548492906105c19084906108f6565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161060d91815260200190565b60405180910390a350505050565b6001600160a01b0382166106425760405163139241eb60e01b815260040160405180910390fd5b6001600160a01b0382166000908152600360205260408120805483929061066a9084906108f6565b92505081905550806002600082825461068391906108f6565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906020015b60405180910390a35050565b6001600160a01b0382166106f557604051638e35e80360e01b815260040160405180910390fd5b6001600160a01b0382166000908152600360205260408120805483929061071d90849061090e565b925050819055508060026000828254610736919061090e565b90915550506040518181526000906001600160a01b038416907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906020016106c2565b600060208083528351808285015260005b818110156107a65785810183015185820160400152820161078a565b818111156107b8576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b03811681146107e557600080fd5b919050565b600080604083850312156107fd57600080fd5b610806836107ce565b946020939093013593505050565b60008060006060848603121561082957600080fd5b610832846107ce565b9250610840602085016107ce565b9150604084013590509250925092565b60006020828403121561086257600080fd5b61086b826107ce565b9392505050565b6000806040838503121561088557600080fd5b61088e836107ce565b915061089c602084016107ce565b90509250929050565b600181811c908216806108b957607f821691505b602082108114156108da57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b60008219821115610909576109096108e0565b500190565b600082821015610920576109206108e0565b50039056fea164736f6c634300080c000a";

type GodModeErc20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GodModeErc20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GodModeErc20__factory extends ContractFactory {
  constructor(...args: GodModeErc20ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    name_: PromiseOrValue<string>,
    symbol_: PromiseOrValue<string>,
    decimals_: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<GodModeErc20> {
    return super.deploy(
      name_,
      symbol_,
      decimals_,
      overrides || {}
    ) as Promise<GodModeErc20>;
  }
  override getDeployTransaction(
    name_: PromiseOrValue<string>,
    symbol_: PromiseOrValue<string>,
    decimals_: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      name_,
      symbol_,
      decimals_,
      overrides || {}
    );
  }
  override attach(address: string): GodModeErc20 {
    return super.attach(address) as GodModeErc20;
  }
  override connect(signer: Signer): GodModeErc20__factory {
    return super.connect(signer) as GodModeErc20__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GodModeErc20Interface {
    return new utils.Interface(_abi) as GodModeErc20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GodModeErc20 {
    return new Contract(address, _abi, signerOrProvider) as GodModeErc20;
  }
}
