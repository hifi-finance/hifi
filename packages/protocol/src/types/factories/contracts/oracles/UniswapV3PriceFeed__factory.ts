/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  UniswapV3PriceFeed,
  UniswapV3PriceFeedInterface,
} from "../../../contracts/oracles/UniswapV3PriceFeed";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IUniswapV3Pool",
        name: "pool_",
        type: "address",
      },
      {
        internalType: "contract IErc20",
        name: "quoteAsset_",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "twapInterval_",
        type: "uint32",
      },
      {
        internalType: "int256",
        name: "maxPrice_",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "IUniswapV3PriceFeed__MaxPriceLessThanOrEqualToZero",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "contract IErc20",
        name: "quoteAsset",
        type: "address",
      },
    ],
    name: "IUniswapV3PriceFeed__QuoteAssetNotInPool",
    type: "error",
  },
  {
    inputs: [],
    name: "IUniswapV3PriceFeed__TwapCriteriaNotSatisfied",
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
    name: "baseAsset",
    outputs: [
      {
        internalType: "contract IErc20",
        name: "",
        type: "address",
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
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
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
    inputs: [
      {
        internalType: "uint80",
        name: "roundId_",
        type: "uint80",
      },
    ],
    name: "getRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxPrice",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
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
    inputs: [],
    name: "pool",
    outputs: [
      {
        internalType: "contract IUniswapV3Pool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quoteAsset",
    outputs: [
      {
        internalType: "contract IErc20",
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
        name: "maxPrice_",
        type: "int256",
      },
    ],
    name: "setMaxPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "twapInterval",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x61018060405234620000b457620000236200001962000128565b9291909162000363565b6040516116e990816200086b82396080518181816101c001526108a7015260a0518181816103900152611008015260c05181818161012b015281816108e60152611078015260e05181818161030a0152610f73015261010051815050610120518181816110d501526111680152610140518161109b0152610160518181816111100152818161119e01526111d60152f35b600080fd5b601f909101601f19168101906001600160401b03821190821017620000dd57604052565b5050634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811614156200010857565b50600080fd5b519063ffffffff82168214156200012157565b5050600080fd5b62001f5460808138039182604051938492620001458285620000b9565b833981010312620001215780516200015d81620000f5565b6020820151926200016e84620000f5565b60606200017e604085016200010e565b9301519193929190565b90816020910312620001215751620001a081620000f5565b90565b506040513d6000823e3d90fd5b519061ffff82168214156200012157565b519060ff82168214156200012157565b51908115158214156200012157565b908160e091031262000121578051620001f981620000f5565b9160208201518060020b8114156200025557916200021a60408201620001b0565b916200022960608301620001b0565b916200023860808201620001b0565b91620001a060c06200024d60a08501620001c1565b9301620001d1565b50505050600080fd5b50634e487b7160e01b600052601160045260246000fd5b61ffff6001911661fffe81116200028a570190565b620002946200025e565b0190565b9061ffff809116918215620002ac57160690565b50505050634e487b7160e01b600052601260045260246000fd5b91908260809103126200012157620002de826200010e565b9160208101518060060b811415620002555791620001a0606060408401516200024d81620000f5565b81811062000313570390565b6200031d6200025e565b0390565b600a9063ffffffff8091168091048211811515166200033e570290565b620003486200025e565b0290565b908160209103126200012157620001a090620001c1565b93929190620003716200082e565b60c05260408051630dfe168160e01b81526004956001600160a01b039190808316906020838a81855afa9283156200081e575b60009362000803575b50836101009316835283855163d21220a760e01b81526020818c81875afa908115620007f3575b600091620007d0575b501661014081815260c051909591906001600160a01b0316855190919062000415906001600160a01b03165b6001600160a01b031690565b90838316918214159182620007c4575b50506200078c575060c0518a9360e093909290916001600160a01b031687516001600160a01b03169180831691161460001462000786575084516001600160a01b03165b60805260a052855192838092633850c7bd851b82525afa801562000776575b600091829162000749575b5088620004c182620004bb620004b46200040960a05160018060a01b031690565b9562000275565b62000298565b6080875180958180620004ec63252c09d760e01b9687835288830191909161ffff6020820193169052565b03915afa93841562000739575b600090819562000718575b50931562000686575b50506200052263ffffffff8093164262000307565b6200054962000542620005358962000321565b63ffffffff607d91160490565b61ffff1690565b9287161191821562000673575b5050620006605760008513156200064d5790620005ef9596620005c6620004096200058d620004096020965160018060a01b031690565b9386518681868163313ce56760e01b998a82525afa9081156200063d575b60009162000624575b5061012052516001600160a01b031690565b93518094819382525afa90811562000614575b600091620005f1575b506101605260e052600155565b565b6200060d9150620006033d82620000b9565b3d8101906200034c565b38620005e2565b6200061e620001a3565b620005d9565b620006369150620006033d82620000b9565b38620005b4565b62000647620001a3565b620005ab565b50505163119ced2160e21b815292505050fd5b50505163a99e764f60e01b815292505050fd5b61ffff9081169116109050388062000556565b60a051929350620006c2926080929190620006aa906001600160a01b031662000409565b90885180958194829383528201906000602083019252565b03915afa90811562000708575b600091620006e2575b509088386200050d565b620006fe9150620006f43d82620000b9565b3d810190620002c6565b50505038620006d8565b62000712620001a3565b620006cf565b90506200072d919450620006f43d82620000b9565b95929150503862000504565b62000743620001a3565b620004f9565b90506200076791506200075d3d82620000b9565b3d810190620001e0565b50505092509050903862000493565b62000780620001a3565b62000488565b62000469565b955163449d059d60e01b81526001600160a01b03909616998601998a525093978897506020019550620007c0945050505050565b0390fd5b14159050388062000425565b620007ec9150620007e23d82620000b9565b3d81019062000188565b38620003dd565b620007fd620001a3565b620003d4565b62000816919350620007e23d82620000b9565b9138620003ad565b62000828620001a3565b620003a4565b3360018060a01b031960005416176000553360007f5c486528ec3e3f0ea91181cff8116f02bfa350e03b8b6f12e00765adbb5af85c81604051a356fe6040608081526004361015610015575b50600080fd5b600090813560e01c806316f0115b1461036857806327163d4a14610351578063313ce567146103365780633c1d5df0146102f65780634b3f2889146102df57806354fd4d50146102c45780637284e4161461029d5780638da5cb5b1461024e5780639a6fc8f5146101fc578063cdf456e1146101ac578063d29d44ee14610192578063e38d6b5c1461016c578063fdf262b7146101175763feaf968c146100bc575061000f565b346101135761010f91506100cf366103de565b6100d76109e2565b945169ffffffffffffffffffff94851681526020810193909352604083019190915260608201529116608082015290819060a0820190565b0390f35b5080fd5b5090346101675750610128366103de565b517f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168152602090f35b809150fd5b50346101135761010f9150610180366103de565b60015490519081529081906020820190565b5034610113576101a96101a436610523565b610622565b51f35b50903461016757506101bd366103de565b517f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168152602090f35b509034610167575061020d366104b9565b61010f610218610f55565b925192839283608090600092949369ffffffffffffffffffff60a083019616825260208201528260408201528260608201520152565b50346101135773ffffffffffffffffffffffffffffffffffffffff61010f92610276366103de565b549151911673ffffffffffffffffffffffffffffffffffffffff1681529081906020820190565b50346101135761010f91506102b1366103de565b6102b961085d565b90519182918261046f565b50903461016757506102d5366103de565b5160018152602090f35b5034610113576102ee366103de565b6101a961055c565b5090346101675750610307366103de565b517f000000000000000000000000000000000000000000000000000000000000000063ffffffff168152602090f35b5090346101675750610347366103de565b5160088152602090f35b5034610113576101a96103633661040a565b6109f5565b5050346103db5750610379366103de565b73ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000166080527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8060a0016080f35b80fd5b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc600091011261000f57565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc602091011261000f5760043590565b918091926000905b82821061045a575011610453575050565b6000910152565b91508060209183015181860152018291610442565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f604093602084526104b2815180928160208801526020888801910161043a565b0116010190565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc602091011261000f5760043569ffffffffffffffffffff81168114156104fd5790565b5050600080fd5b73ffffffffffffffffffffffffffffffffffffffff8116141561000f57565b7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc602091011261000f5760043561055981610504565b90565b6000549073ffffffffffffffffffffffffffffffffffffffff821691338314156105d15760007fffffffffffffffffffffffff000000000000000000000000000000000000000092937f5c486528ec3e3f0ea91181cff8116f02bfa350e03b8b6f12e00765adbb5af85c82604051a316600055565b50506040517fcc6bdb1d00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff919091166004820152336024820152604490fd5b6000549073ffffffffffffffffffffffffffffffffffffffff80831691338314156106ce57169182156106a057827fffffffffffffffffffffffff0000000000000000000000000000000000000000927f5c486528ec3e3f0ea91181cff8116f02bfa350e03b8b6f12e00765adbb5af85c6000604051a31617600055565b5050505060046040517f4208fc5d000000000000000000000000000000000000000000000000000000008152fd5b50506040517fcc6bdb1d00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff919091166004820152336024820152604492509050fd5b507f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff82111761079357604052565b61079b610722565b604052565b60208183031261084857805167ffffffffffffffff9182821161083e57019082601f83011215610828578151908111610831575b6040519261080a60207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8501160185610752565b8184526020828401011161082857610559916020808501910161043a565b50505050600080fd5b610839610722565b6107d4565b5050505050600080fd5b505050600080fd5b506040513d6000823e3d90fd5b6040517f95d89b4100000000000000000000000000000000000000000000000000000000908181526000918273ffffffffffffffffffffffffffffffffffffffff918184600481867f0000000000000000000000000000000000000000000000000000000000000000165afa9384156109d5575b82946109ba575b5060046040518094819382527f0000000000000000000000000000000000000000000000000000000000000000165afa9283156109ad575b8093610982575b5050602361055991604051938161093886935180926020808701910161043a565b82017f202f2000000000000000000000000000000000000000000000000000000000006020820152610973825180936020878501910161043a565b01036003810184520182610752565b6105599293506023916109a6913d90823e61099d3d82610752565b3d8101906107a0565b9291610917565b6109b5610850565b610910565b6109ce9194503d83823e61099d3d82610752565b92386108d8565b6109dd610850565b6108d1565b6109ea610f55565b600091829042908290565b73ffffffffffffffffffffffffffffffffffffffff6000541633811415610a5157506000811315610a2557600155565b505060046040517f4673b484000000000000000000000000000000000000000000000000000000008152fd5b6040517fcc6bdb1d00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff919091166004820152336024820152604492509050fd5b60209067ffffffffffffffff8111610abd575b60051b0190565b610ac5610722565b610ab6565b604051906060820182811067ffffffffffffffff821117610af8575b60405260028252604082602036910137565b610b00610722565b610ae6565b507f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602090805115610b43570190565b610b4b610b05565b0190565b604090805160011015610b43570190565b81601f8201121561084857805191610b7783610aa3565b92610b856040519485610752565b808452602092838086019260051b820101928311610bc8578301905b828210610baf575050505090565b8380918351610bbd81610504565b815201910190610ba1565b505050505050600080fd5b9190916040818403126108485780519267ffffffffffffffff9384811161083e5782019381601f8601121561083e57845194610c0e86610aa3565b90610c1c6040519283610752565b868252602096878084019160051b83010191858311610c81578801905b828210610c58575050509483015190811161083e576105599201610b60565b81518060060b811415610c72578152908801908801610c39565b50505050505050505050600080fd5b505050505050505050600080fd5b6020908160408183019282815285518094520193019160005b828110610cb6575050505090565b835163ffffffff1685529381019392810192600101610ca8565b507f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60060b9060060b9060008212827fffffffffffffffffffffffffffffffffffffffffffffffffff80000000000000018212811516610d5a575b82667fffffffffffff01821316610d4e570390565b610d56610cd0565b0390565b610d62610cd0565b610d39565b507f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60060b9060060b908115610e01575b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82147fffffffffffffffffffffffffffffffffffffffffffffffffff80000000000000821416610df5570590565b610dfd610cd0565b0590565b610e09610d67565b610da6565b60ff168060ff03600811610e23575b60080190565b610e2b610cd0565b610e1d565b60ff168060ff03601011610e45575b60100190565b610e4d610cd0565b610e3f565b60ff16604d8111610e64575b600a0a90565b610e6c610cd0565b610e5e565b8015610e96575b78010000000000000000000000000000000000000000000000000490565b610e9e610d67565b610e78565b8015610ecf575b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0490565b610ed7610d67565b610eaa565b8115610ee6570490565b610eee610d67565b0490565b8115610f48575b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82147f8000000000000000000000000000000000000000000000000000000000000000821416610df5570590565b610f50610d67565b610ef9565b610fe961107661107161106b610f69610aca565b63ffffffff6110607f000000000000000000000000000000000000000000000000000000000000000092610fab84610fa083610b35565b9063ffffffff169052565b6000610fb682610b4f565b526040519788917f883bdbfd00000000000000000000000000000000000000000000000000000000835260048301610c8f565b039660008173ffffffffffffffffffffffffffffffffffffffff99818b7f0000000000000000000000000000000000000000000000000000000000000000165afa90811561121c575b6000916111fa575b5061105a61104d61105461104d84610b4f565b5160060b90565b92610b35565b90610d00565b911660030b90610d97565b60020b90565b61133e565b7f000000000000000000000000000000000000000000000000000000000000000082167f0000000000000000000000000000000000000000000000000000000000000000831614156111595761110b9061113a926111036110fe6110f97f0000000000000000000000000000000000000000000000000000000000000000610e0e565b610e52565b610e71565b911680611230565b6111347f0000000000000000000000000000000000000000000000000000000000000000610e52565b90610edc565b905b6001548083136111555750811561114f57565b60019150565b9150565b61118c916111036110fe6110f97f0000000000000000000000000000000000000000000000000000000000000000610e0e565b80156111cd576111c7906111c26110f97f0000000000000000000000000000000000000000000000000000000000000000610e30565b610ef2565b9061113c565b506105596110f97f0000000000000000000000000000000000000000000000000000000000000000610e30565b611215913d90823e61120c3d82610752565b3d810190610bd3565b503861103a565b611224610850565b611032565b1561000f57565b90917fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83830992808302928380861095039480860395146112c957908291611279868411611229565b096001821901821680920460028082600302188083028203028083028203028083028203028083028203028083028203028092029003029360018380600003040190848311900302920304170290565b50509150610eee821515611229565b156112df57565b5060646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600160248201527f54000000000000000000000000000000000000000000000000000000000000006044820152fd5b73ffffffffffffffffffffffffffffffffffffffff9060020b60008112156116c85780600003905b611375620d89e88311156112d8565b600182161561169f5770ffffffffffffffffffffffffffffffffff6ffffcb933bd6fad37aa2d162d1a5940015b169160028116611683575b60048116611667575b6008811661164b575b6010811661162f575b60208116611613575b604081166115f7575b6080908181166115dc575b61010081166115c1575b61020081166115a6575b610400811661158b575b6108008116611570575b6110008116611555575b612000811661153a575b614000811661151f575b6180008116611504575b6201000081166114e9575b6202000081166114cf575b6204000081166114b5575b620800001661149a575b5060001261148c575b63ffffffff81166114835760ff60005b169060201c011690565b60ff6001611479565b61149590610ea3565b611469565b6b048a170391f7dc42444e8fa26000929302901c9190611460565b6d2216e584f5fa1ea926041bedfe98909302811c92611456565b926e5d6af8dedb81196699c329225ee60402811c9261144b565b926f09aa508b5b7a84e1c677de54f3e99bc902811c92611440565b926f31be135f97d08fd981231505542fcfa602811c92611435565b926f70d869a156d2a1b890bb3df62baf32f702811c9261142b565b926fa9f746462d870fdf8a65dc1f90e061e502811c92611421565b926fd097f3bdfd2022b8845ad8f792aa582502811c92611417565b926fe7159475a2c29b7443b29c7fa6e889d902811c9261140d565b926ff3392b0822b70005940c7a398e4b70f302811c92611403565b926ff987a7253ac413176f2b074cf7815e5402811c926113f9565b926ffcbe86c7900a88aedcffc83b479aa3a402811c926113ef565b926ffe5dee046a99a2a811c461f1969c305302811c926113e5565b916fff2ea16466c96a3843ec78b326b528610260801c916113da565b916fff973b41fa98c081472e6896dfb254c00260801c916113d1565b916fffcb9843d60f6159c9db58835c9266440260801c916113c8565b916fffe5caca7e10e4e61c3624eaa0941cd00260801c916113bf565b916ffff2e50f5f656932ef12357cf3c7fdcc0260801c916113b6565b916ffff97272373d413259a46990580e213a0260801c916113ad565b70ffffffffffffffffffffffffffffffffff7001000000000000000000000000000000006113a2565b8061136656fea26c6578706572696d656e74616cf564736f6c634300080c0018";

type UniswapV3PriceFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UniswapV3PriceFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UniswapV3PriceFeed__factory extends ContractFactory {
  constructor(...args: UniswapV3PriceFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    pool_: string,
    quoteAsset_: string,
    twapInterval_: BigNumberish,
    maxPrice_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<UniswapV3PriceFeed> {
    return super.deploy(
      pool_,
      quoteAsset_,
      twapInterval_,
      maxPrice_,
      overrides || {}
    ) as Promise<UniswapV3PriceFeed>;
  }
  override getDeployTransaction(
    pool_: string,
    quoteAsset_: string,
    twapInterval_: BigNumberish,
    maxPrice_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      pool_,
      quoteAsset_,
      twapInterval_,
      maxPrice_,
      overrides || {}
    );
  }
  override attach(address: string): UniswapV3PriceFeed {
    return super.attach(address) as UniswapV3PriceFeed;
  }
  override connect(signer: Signer): UniswapV3PriceFeed__factory {
    return super.connect(signer) as UniswapV3PriceFeed__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniswapV3PriceFeedInterface {
    return new utils.Interface(_abi) as UniswapV3PriceFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UniswapV3PriceFeed {
    return new Contract(address, _abi, signerOrProvider) as UniswapV3PriceFeed;
  }
}
