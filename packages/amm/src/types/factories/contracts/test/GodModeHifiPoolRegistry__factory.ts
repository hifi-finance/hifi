/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  GodModeHifiPoolRegistry,
  GodModeHifiPoolRegistryInterface,
} from "../../../contracts/test/GodModeHifiPoolRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "pool",
        type: "address",
      },
    ],
    name: "HifiPoolRegistry__PoolAlreadyTracked",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "pool",
        type: "address",
      },
    ],
    name: "HifiPoolRegistry__PoolNotTracked",
    type: "error",
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
        name: "caller",
        type: "address",
      },
    ],
    name: "Ownable__NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Ownable__OwnerZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IHifiPool",
        name: "pool",
        type: "address",
      },
    ],
    name: "TrackPool",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "TransferOwnership",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IHifiPool",
        name: "pool",
        type: "address",
      },
    ],
    name: "UntrackPool",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool[]",
        name: "pools_",
        type: "address[]",
      },
    ],
    name: "__godMode_trackPools",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool[]",
        name: "pools_",
        type: "address[]",
      },
    ],
    name: "__godMode_untrackPools",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "_renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "_transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "pools",
    outputs: [
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
        internalType: "contract IHifiPool",
        name: "pool",
        type: "address",
      },
    ],
    name: "trackPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IHifiPool",
        name: "pool",
        type: "address",
      },
    ],
    name: "untrackPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50600080546001600160a01b031916339081178255604051909182917f5c486528ec3e3f0ea91181cff8116f02bfa350e03b8b6f12e00765adbb5af85c908290a350610649806100616000396000f3fe608060405234801561001057600080fd5b50600436106100875760003560e01c80638da5cb5b1161005b5780638da5cb5b146100cf578063a4063dbc146100ff578063d29d44ee14610132578063df5f3d3d1461014557600080fd5b80623b2a6e1461008c5780630277d5df146100a15780634b3f2889146100b4578063861ef291146100bc575b600080fd5b61009f61009a36600461054c565b610158565b005b61009f6100af3660046105d9565b6101cf565b61009f6102a1565b61009f6100ca3660046105d9565b610338565b6000546100e2906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b61012261010d3660046105d9565b60016020526000908152604090205460ff1681565b60405190151581526020016100f6565b61009f6101403660046105d9565b61040c565b61009f61015336600461054c565b6104db565b60005b818110156101ca5760006001600085858581811061017b5761017b6105fd565b905060200201602081019061019091906105d9565b6001600160a01b031681526020810191909152604001600020805460ff1916911515919091179055806101c281610613565b91505061015b565b505050565b6000546001600160a01b031633146102145760005460405163cc6bdb1d60e01b81526001600160a01b0390911660048201523360248201526044015b60405180910390fd5b6001600160a01b03811660009081526001602052604090205460ff1661025857604051633a1250a960e11b81526001600160a01b038216600482015260240161020b565b6001600160a01b038116600081815260016020526040808220805460ff19169055517fdf0dec6038d4ee9ad1e3d2d6f7d3ec2787a65b573ed732119739e6b84314e48c9190a250565b6000546001600160a01b031633146102e15760005460405163cc6bdb1d60e01b81526001600160a01b03909116600482015233602482015260440161020b565b600080546040516001600160a01b03909116907f5c486528ec3e3f0ea91181cff8116f02bfa350e03b8b6f12e00765adbb5af85c908390a36000805473ffffffffffffffffffffffffffffffffffffffff19169055565b6000546001600160a01b031633146103785760005460405163cc6bdb1d60e01b81526001600160a01b03909116600482015233602482015260440161020b565b6001600160a01b03811660009081526001602052604090205460ff16156103bd57604051631815cc3160e01b81526001600160a01b038216600482015260240161020b565b6001600160a01b0381166000818152600160208190526040808320805460ff1916909217909155517ff08e1bd32e520cc014e93234b65a1349b95dd125a050ea5a70dcb8ae856921629190a250565b6000546001600160a01b0316331461044c5760005460405163cc6bdb1d60e01b81526001600160a01b03909116600482015233602482015260440161020b565b6001600160a01b03811661047357604051634208fc5d60e01b815260040160405180910390fd5b600080546040516001600160a01b03808516939216917f5c486528ec3e3f0ea91181cff8116f02bfa350e03b8b6f12e00765adbb5af85c91a36000805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0392909216919091179055565b60005b818110156101ca5760018060008585858181106104fd576104fd6105fd565b905060200201602081019061051291906105d9565b6001600160a01b031681526020810191909152604001600020805460ff19169115159190911790558061054481610613565b9150506104de565b6000806020838503121561055f57600080fd5b823567ffffffffffffffff8082111561057757600080fd5b818501915085601f83011261058b57600080fd5b81358181111561059a57600080fd5b8660208260051b85010111156105af57600080fd5b60209290920196919550909350505050565b6001600160a01b03811681146105d657600080fd5b50565b6000602082840312156105eb57600080fd5b81356105f6816105c1565b9392505050565b634e487b7160e01b600052603260045260246000fd5b600060001982141561063557634e487b7160e01b600052601160045260246000fd5b506001019056fea164736f6c634300080c000a";

type GodModeHifiPoolRegistryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GodModeHifiPoolRegistryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GodModeHifiPoolRegistry__factory extends ContractFactory {
  constructor(...args: GodModeHifiPoolRegistryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<GodModeHifiPoolRegistry> {
    return super.deploy(overrides || {}) as Promise<GodModeHifiPoolRegistry>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): GodModeHifiPoolRegistry {
    return super.attach(address) as GodModeHifiPoolRegistry;
  }
  override connect(signer: Signer): GodModeHifiPoolRegistry__factory {
    return super.connect(signer) as GodModeHifiPoolRegistry__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GodModeHifiPoolRegistryInterface {
    return new utils.Interface(_abi) as GodModeHifiPoolRegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GodModeHifiPoolRegistry {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as GodModeHifiPoolRegistry;
  }
}
