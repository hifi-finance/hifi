# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2021-09-16

### Added

- `Erc20` contract in npm package bundle.

### Changed

- Allow any `UniswapV2Pair` to call the `HifiFlashUniswapV2` contract.
- Polish NatSpec comments.
- Upgrade to `ethers` v5.4.6.
- Upgrade to `@hifi/protocol` v1.5.0.
- Upgrade to `@paulrberg/contracts` v3.5.2.
- Use "pre" and "post" prefixes instead of "old" and "new".
- Use Solidity v0.8.7.

### Fixed

- Typos in NatSpec comments.

### Removed

- `pairs` mapping in the `HifiFlashUniswapV2` contract.
- `pairs_` argument in the `HifiFlashUniswapV2` contract constructor.

## [1.3.1] - 2021-08-13

### Fixed

- Remove test contracts from npm package bundle.

## [1.3.0] - 2021-08-13

### Added

- Ethers as a peer dependency.
- TypeChain bindings for IErc20 and IUniswapV2Callee in the npm package bundle.
- New `HifiPoolRegistry.sol` contract, to track deployed AMMs.
- TypeChain factories in the npm package bundle.

### Changed

- Hardcode Uniswap v2 contracts to fix the TypeChain bindings bug.
- Upgrade to @hifi/protocol@1.4.0.

### Fixed

- TypeChain binding for IErc20.

## [1.2.0] - 2021-08-03

### Changed

- Upgrade to @hifi/protocol@1.3.0.

## [1.1.0] - 2021-08-03

### Changed

- Disable the Solidity compiler metadata hash for the v0.8.6 contracts.
- Upgrade to @hifi/protocol@1.2.0.

### Fixed

- Include the `commons.ts` file in the `typechain` folder shipped to the npm registry.

## [1.0.1] - 2021-07-30

### Changed

- Affix all dependency versions.

## [1.0.0] - 2021-06-30

### Added

- First release of the package.

[1.4.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.3.1...@hifi/flash-swap@1.4.0
[1.3.1]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.3.0...@hifi/flash-swap@1.3.1
[1.3.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.2.0...@hifi/flash-swap@1.3.0
[1.2.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.1.0...@hifi/flash-swap@1.2.0
[1.1.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.0.1...@hifi/flash-swap@1.1.0
[1.0.1]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.0.0...@hifi/flash-swap@1.0.1
[1.0.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/flash-swap@1.0.0
