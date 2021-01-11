# Hifi Protocol [![Coverage Status](https://coveralls.io/repos/github/hifi-finance/hifi-protocol/badge.svg?branch=main)](https://coveralls.io/github/hifi-finance/hifi-protocol?branch=main) [![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![License: LGPL3.0](https://img.shields.io/badge/license-LGPL3.0-yellow.svg)](https://opensource.org/licenses/lgpl-3.0)

An implementation of zero-coupon bonds on the Ethereum blockchain. In-depth documentation on Hifi is available at [docs.hifi.finance](https://docs.hifi.finance).

The built contract artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@hifi/v1@latest/).

## Developers

Our contracts are written in Solidity and our tests in TypeScript.

If you want to contribute, familiarity with [Hardhat](https://github.com/nomiclabs/hardhat), [Ethers](https://github.com/ethers-io/ethers.js),
[Waffle](https://github.com/EthWorks/Waffle) and [TypeChain](https://github.com/ethereum-ts/TypeChain) is needed.

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Compile

Compile the smart contracts with Buidler:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn build
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Format Code

Run the Prettier formatter:

```sh
$ yarn prettier
```

### Test Unit

Run the unit tests:

```sh
$ yarn test:unit
```

### Test Integration

Run the integration tests:

```sh
$ yarn test:integration
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Buidler cache:

```sh
$ yarn clean
```

## Acknowledgements

- Dan Robinson and Allan Niemerg, for their work on [The Yield Protocol: On-Chain Lending With Interest Rate
  Discovery](https://research.paradigm.xyz/Yield.pdf), which shaped many of our protocol design choices.
- The Compound Finance team, for the [Open Price
  Feed](https://compound.finance/docs/prices) and their math libraries.
- OpenZeppelin, for their [outstanding smart contract library](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts).

## Discussion

For any concerns or feedback, open an issue or visit us on [Discord](https://discord.gg/mhtSRz6) to discuss.

## License

Everything is released under the [LGPL3.0 license](./LICENSE.md).
