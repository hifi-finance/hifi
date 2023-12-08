/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  FlashUniswapV3,
  FlashUniswapV3Interface,
} from "../../../contracts/uniswap-v3/FlashUniswapV3";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IBalanceSheetV2",
        name: "balanceSheet_",
        type: "address",
      },
      {
        internalType: "address",
        name: "uniV3Factory_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "FlashUniswapV3__CallNotAuthorized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountOutExpected",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutReceived",
        type: "uint256",
      },
    ],
    name: "FlashUniswapV3__InsufficientSwapOutputAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
    ],
    name: "FlashUniswapV3__LiquidateUnderlyingBackedVault",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "seizeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256",
      },
      {
        internalType: "int256",
        name: "turnout",
        type: "int256",
      },
    ],
    name: "FlashUniswapV3__TurnoutNotSatisfied",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "SafeErc20__CallToNonContract",
    type: "error",
  },
  {
    inputs: [],
    name: "SafeErc20__NoReturnData",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "liquidator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bond",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "collateral",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "underlyingAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "seizeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "repayAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "subsidyAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "profitAmount",
        type: "uint256",
      },
    ],
    name: "FlashLiquidate",
    type: "event",
  },
  {
    inputs: [],
    name: "balanceSheet",
    outputs: [
      {
        internalType: "contract IBalanceSheetV2",
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
        components: [
          {
            internalType: "address",
            name: "borrower",
            type: "address",
          },
          {
            internalType: "contract IHToken",
            name: "bond",
            type: "address",
          },
          {
            internalType: "contract IErc20",
            name: "collateral",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "path",
            type: "bytes",
          },
          {
            internalType: "int256",
            name: "turnout",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "underlyingAmount",
            type: "uint256",
          },
        ],
        internalType: "struct IFlashUniswapV3.FlashLiquidateParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "flashLiquidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "uniV3Factory",
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
        internalType: "int256",
        name: "amount0Delta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1Delta",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c06040523480156200001157600080fd5b5060405162001b6338038062001b63833981016040819052620000349162000065565b6001600160a01b039182166080521660a052620000a4565b6001600160a01b03811681146200006257600080fd5b50565b600080604083850312156200007957600080fd5b825162000086816200004c565b602084015190925062000099816200004c565b809150509250929050565b60805160a051611a78620000eb6000396000818160ae015261082c015260008181605601528181610be701528181610c8601528181610d1e0152610e560152611a786000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806322285cf6146100515780633c21077e14610094578063705e474b146100a9578063fa461e33146100d0575b600080fd5b6100787f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200160405180910390f35b6100a76100a236600461159a565b6100e3565b005b6100787f000000000000000000000000000000000000000000000000000000000000000081565b6100a76100de366004611657565b61022b565b60408051602081019091526000815281602001516001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa158015610134573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061015891906116d7565b6001600160a01b03908116808352604084015190911614156101a957815181516040516356c284cb60e11b81526001600160a01b039283166004820152911660248201526044015b60405180910390fd5b6102268260a00151306040518060e0016040528086602001516001600160a01b0316815260200186600001516001600160a01b0316815260200186604001516001600160a01b0316815260200186606001518152602001336001600160a01b03168152602001866080015181526020018660a00151815250610508565b505050565b61025d6040518060a0016040528060008152602001600081526020016000815260200160008152602001600081525090565b600061026b838501856116f4565b9050600080600061027f84606001516106db565b925092509250610298610293838584610717565b61078e565b6001600160a01b0316336001600160a01b0316146102cb57604051639b2d751d60e01b81523360048201526024016101a0565b6102d884606001516108ae565b15610305576102ea84606001516108e8565b606085015260408501516102ff903386610508565b506104fd565b61031784600001518560c0015161091f565b80865260208501518551604087015161032f93610bbb565b6060860152600089136103425787610344565b885b6040860181905260a0850151610359916117d2565b8560600151121561039a57606085015160408087015160a08701519151636d0db81160e01b81526004810193909352602483015260448201526064016101a0565b8460600151856040015111156103e4576060850151604080870151919091036080808801829052860151918601516103df926001600160a01b03909116913090610f32565b610425565b8460400151856060015111156104255760408086015160608701510360208701819052608086015191860151610425926001600160a01b0390911691610fd0565b61044b33866040015186604001516001600160a01b0316610fd09092919063ffffffff16565b83600001516001600160a01b031684602001516001600160a01b031685608001516001600160a01b03167f8e4c31c4deff218c705ee01f5c23123c4864d19b598eabe8c6d3e9768ae983ef87604001518860c001518a606001518b604001518c608001518d602001516040516104f4969594939291906001600160a01b03969096168652602086019490945260408501929092526060840152608083015260a082015260c00190565b60405180910390a45b505050505050505050565b6040805160a081018252600080825260208201819052918101829052606081018290526080810182905261053f83606001516106db565b62ffffff16602084018190526001600160a01b0391821660408501819052929091166060840181905280831060808501526000928392610583926102939291610717565b6001600160a01b031663128acb088785608001518a6105a19061182b565b87608001516105ce576105c9600173fffd8963efd1fc6a506488495d951d5263988d26611848565b6105de565b6105de6401000276a36001611870565b8a6040516020016105ef91906118f3565b6040516020818303038152906040526040518663ffffffff1660e01b815260040161061e959493929190611969565b60408051808303816000875af115801561063c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061066091906119ae565b91509150826080015161067c57806106778361182b565b610686565b816106868261182b565b80855290945087146106d15782516040517fff454b820000000000000000000000000000000000000000000000000000000081526101a0918991600401918252602082015260400190565b5050509392505050565b600080806106e98482611000565b92506106f68460146110d0565b905061070e610707600360146119d2565b8590611000565b91509193909250565b6040805160608101825260008082526020820181905291810191909152826001600160a01b0316846001600160a01b03161115610752579192915b6040518060600160405280856001600160a01b03168152602001846001600160a01b031681526020018362ffffff1681525090505b9392505050565b600081602001516001600160a01b031682600001516001600160a01b0316106107b657600080fd5b815160208084015160408086015181516001600160a01b0395861681860152949092168482015262ffffff90911660608085019190915281518085038201815260808501909252815191909201207fff0000000000000000000000000000000000000000000000000000000000000060a08401527f000000000000000000000000000000000000000000000000000000000000000090911b6bffffffffffffffffffffffff191660a183015260b58201527fe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b5460d582015260f50160408051601f19818403018152919052805160209091012092915050565b60006108bc600360146119d2565b60146108c96003826119d2565b6108d391906119d2565b6108dd91906119d2565b825110159050919050565b60606109196108f9600360146119d2565b610905600360146119d2565b845161091191906119ea565b849190611190565b92915050565b600080836001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa158015610960573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061098491906116d7565b604051636eb1769f60e11b81523060048201526001600160a01b03868116602483015291925060009183169063dd62ed3e90604401602060405180830381865afa1580156109d6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109fa9190611a01565b905083811015610a7a5760405163095ea7b360e01b81526001600160a01b038681166004830152600019602483015283169063095ea7b3906044016020604051808303816000875af1158015610a54573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a789190611a1a565b505b6040516370a0823160e01b81523060048201526000906001600160a01b038716906370a0823190602401602060405180830381865afa158015610ac1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ae59190611a01565b60405163b9f5be4160e01b8152600481018790529091506001600160a01b0387169063b9f5be4190602401600060405180830381600087803b158015610b2a57600080fd5b505af1158015610b3e573d6000803e3d6000fd5b50506040516370a0823160e01b8152306004820152600092506001600160a01b03891691506370a0823190602401602060405180830381865afa158015610b89573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bad9190611a01565b919091039695505050505050565b604051630f20729d60e11b81526001600160a01b038581166004830152838116602483015260009182917f00000000000000000000000000000000000000000000000000000000000000001690631e40e53a90604401602060405180830381865afa158015610c2e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c529190611a01565b60405163f37765c760e01b81526001600160a01b0386811660048301526024820183905287811660448301529192506000917f0000000000000000000000000000000000000000000000000000000000000000169063f37765c790606401602060405180830381865afa158015610ccd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cf19190611a01565b604051634d7c892f60e01b81526001600160a01b03898116600483015288811660248301529192506000917f00000000000000000000000000000000000000000000000000000000000000001690634d7c892f90604401602060405180830381865afa158015610d65573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d899190611a01565b90506000818311610d9a5782610d9c565b815b90506000818711610dad5786610daf565b815b6040516370a0823160e01b81523060048201529091506000906001600160a01b038a16906370a0823190602401602060405180830381865afa158015610df9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e1d9190611a01565b604051630c9fae0f60e31b81526001600160a01b038d811660048301528c81166024830152604482018590528b811660648301529192507f0000000000000000000000000000000000000000000000000000000000000000909116906364fd707890608401600060405180830381600087803b158015610e9c57600080fd5b505af1158015610eb0573d6000803e3d6000fd5b50506040516370a0823160e01b8152306004820152600092506001600160a01b038c1691506370a0823190602401602060405180830381865afa158015610efb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f1f9190611a01565b919091039b9a5050505050505050505050565b6040516001600160a01b0380851660248301528316604482015260648101829052610fca9085906323b872dd60e01b906084015b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff00000000000000000000000000000000000000000000000000000000909316929092179091526112f3565b50505050565b6040516001600160a01b03831660248201526044810182905261022690849063a9059cbb60e01b90606401610f66565b60008161100e8160146119d2565b101561105c5760405162461bcd60e51b815260206004820152601260248201527f746f416464726573735f6f766572666c6f77000000000000000000000000000060448201526064016101a0565b6110678260146119d2565b835110156110b75760405162461bcd60e51b815260206004820152601560248201527f746f416464726573735f6f75744f66426f756e6473000000000000000000000060448201526064016101a0565b5001602001516c01000000000000000000000000900490565b6000816110de8160036119d2565b101561112c5760405162461bcd60e51b815260206004820152601160248201527f746f55696e7432345f6f766572666c6f7700000000000000000000000000000060448201526064016101a0565b6111378260036119d2565b835110156111875760405162461bcd60e51b815260206004820152601460248201527f746f55696e7432345f6f75744f66426f756e647300000000000000000000000060448201526064016101a0565b50016003015190565b60608161119e81601f6119d2565b10156111dd5760405162461bcd60e51b815260206004820152600e60248201526d736c6963655f6f766572666c6f7760901b60448201526064016101a0565b826111e883826119d2565b10156112275760405162461bcd60e51b815260206004820152600e60248201526d736c6963655f6f766572666c6f7760901b60448201526064016101a0565b61123182846119d2565b845110156112815760405162461bcd60e51b815260206004820152601160248201527f736c6963655f6f75744f66426f756e647300000000000000000000000000000060448201526064016101a0565b6060821580156112a057604051915060008252602082016040526112ea565b6040519150601f8416801560200281840101858101878315602002848b0101015b818310156112d95780518352602092830192016112c1565b5050858452601f01601f1916604052505b50949350505050565b600061133583836040518060400160405280601581526020017f5361666545726332304c6f774c6576656c43616c6c0000000000000000000000815250611370565b80519091501561022657808060200190518101906113539190611a1a565b610226576040516364d6fc4d60e01b815260040160405180910390fd5b6060611384846001600160a01b0316611447565b6113ac57604051638201cc0560e01b81526001600160a01b03851660048201526024016101a0565b600080856001600160a01b0316856040516113c79190611a3c565b6000604051808303816000865af19150503d8060008114611404576040519150601f19603f3d011682016040523d82523d6000602084013e611409565b606091505b5091509150811561141d5791506107879050565b80511561142d5780518082602001fd5b8360405162461bcd60e51b81526004016101a09190611a58565b6000813f7fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a47081811480159061147b57508115155b949350505050565b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff811182821017156114bc576114bc611483565b60405290565b60405160e0810167ffffffffffffffff811182821017156114bc576114bc611483565b6001600160a01b03811681146114fa57600080fd5b50565b8035611508816114e5565b919050565b600082601f83011261151e57600080fd5b813567ffffffffffffffff8082111561153957611539611483565b604051601f8301601f19908116603f0116810190828211818310171561156157611561611483565b8160405283815286602085880101111561157a57600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000602082840312156115ac57600080fd5b813567ffffffffffffffff808211156115c457600080fd5b9083019060c082860312156115d857600080fd5b6115e0611499565b82356115eb816114e5565b815260208301356115fb816114e5565b6020820152604083013561160e816114e5565b604082015260608301358281111561162557600080fd5b6116318782860161150d565b6060830152506080830135608082015260a083013560a082015280935050505092915050565b6000806000806060858703121561166d57600080fd5b8435935060208501359250604085013567ffffffffffffffff8082111561169357600080fd5b818701915087601f8301126116a757600080fd5b8135818111156116b657600080fd5b8860208285010111156116c857600080fd5b95989497505060200194505050565b6000602082840312156116e957600080fd5b8151610787816114e5565b60006020828403121561170657600080fd5b813567ffffffffffffffff8082111561171e57600080fd5b9083019060e0828603121561173257600080fd5b61173a6114c2565b611743836114fd565b8152611751602084016114fd565b6020820152611762604084016114fd565b604082015260608301358281111561177957600080fd5b6117858782860161150d565b606083015250611797608084016114fd565b608082015260a083013560a082015260c083013560c082015280935050505092915050565b634e487b7160e01b600052601160045260246000fd5b6000808212827f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0384138115161561180c5761180c6117bc565b600160ff1b8390038412811615611825576118256117bc565b50500190565b6000600160ff1b821415611841576118416117bc565b5060000390565b60006001600160a01b0383811690831681811015611868576118686117bc565b039392505050565b60006001600160a01b03808316818516808303821115611892576118926117bc565b01949350505050565b60005b838110156118b657818101518382015260200161189e565b83811115610fca5750506000910152565b600081518084526118df81602086016020860161189b565b601f01601f19169290920160200192915050565b6020815260006001600160a01b03808451166020840152806020850151166040840152806040850151166060840152606084015160e0608085015261193c6101008501826118c7565b90508160808601511660a085015260a085015160c085015260c085015160e0850152809250505092915050565b60006001600160a01b038088168352861515602084015285604084015280851660608401525060a060808301526119a360a08301846118c7565b979650505050505050565b600080604083850312156119c157600080fd5b505080516020909101519092909150565b600082198211156119e5576119e56117bc565b500190565b6000828210156119fc576119fc6117bc565b500390565b600060208284031215611a1357600080fd5b5051919050565b600060208284031215611a2c57600080fd5b8151801515811461078757600080fd5b60008251611a4e81846020870161189b565b9190910192915050565b60208152600061078760208301846118c756fea164736f6c634300080c000a";

type FlashUniswapV3ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlashUniswapV3ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlashUniswapV3__factory extends ContractFactory {
  constructor(...args: FlashUniswapV3ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    balanceSheet_: PromiseOrValue<string>,
    uniV3Factory_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlashUniswapV3> {
    return super.deploy(
      balanceSheet_,
      uniV3Factory_,
      overrides || {}
    ) as Promise<FlashUniswapV3>;
  }
  override getDeployTransaction(
    balanceSheet_: PromiseOrValue<string>,
    uniV3Factory_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      balanceSheet_,
      uniV3Factory_,
      overrides || {}
    );
  }
  override attach(address: string): FlashUniswapV3 {
    return super.attach(address) as FlashUniswapV3;
  }
  override connect(signer: Signer): FlashUniswapV3__factory {
    return super.connect(signer) as FlashUniswapV3__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlashUniswapV3Interface {
    return new utils.Interface(_abi) as FlashUniswapV3Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FlashUniswapV3 {
    return new Contract(address, _abi, signerOrProvider) as FlashUniswapV3;
  }
}
