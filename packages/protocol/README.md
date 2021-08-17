# Hifi Protocol

An implementation of zero-coupon bonds on the Ethereum blockchain. In-depth documentation is available at [docs.hifi.finance](https://docs.hifi.finance).

The built contract artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@hifi/protocol@latest/).

## Usage

The contracts are written in Solidity and the tests in TypeScript. If you want to contribute, familiarity with Hardhat,
Ethers and Waffle is requisite.

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
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

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

## Acknowledgements

- Dan Robinson and Allan Niemerg, for their work on [The Yield Protocol: On-Chain Lending With Interest Rate
  Discovery](https://research.paradigm.xyz/Yield.pdf), which shaped many of our protocol design choices.
- Chainlink, for their [Price Feeds](https://docs.chain.link/docs/using-chainlink-reference-contracts).
- OpenZeppelin, for their outstanding [upgradeable contracts library](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts).

## Discussion

For any concerns or feedback, open an issue or visit us on [Discord](https://discord.gg/mhtSRz6) to discuss.

## License

Everything is released under the [LGPL3.0 license](./LICENSE.md).
