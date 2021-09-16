# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2021-09-16

### Added

- `getBurnOutputs` function in the `HifiPool` contract.

### Changed

- Polish NatSpec comments.
- Rename `getMintParams` function to `getMintInputs`.
- Upgrade to `ethers` v5.4.6.
- Upgrade to `@hifi/protocol` v1.5.0.
- Upgrade to `@paulrberg/contracts` v3.5.2.
- Upgrade to Solidity compiler v0.8.7.

### Fixed

- Allow minting of LP tokens only before maturity.
- Typos in NatSpec comments.

## [1.4.0] - 2021-08-13

### Added

- Ethers as a peer dependency.
- Erc20, Erc20Permit and Ownable in the npm package bundle.
- New `HifiPoolRegistry.sol` contract, to track deployed AMMs.
- TypeChain factories in the npm package bundle.

### Changed

- Upgrade to `@hifi/protocol` v1.4.0.

## [1.3.0] - 2021-08-03

### Changed

- Reword NatSpec for constructor function.
- Upgrade to `@hifi/protocol` v1.3.0.

## [1.2.1] - 2021-08-03

### Changed

- Fix indenting in `YieldSpace.sol`.

## [1.2.0] - 2021-08-03

### Changed

- Disable the Solidity compiler metadata hash.
- Upgrade to `@hifi/protocol` v1.2.0.

### Fixed

- Include the `commons.ts` file in the `typechain` folder shipped to the npm registry.

## [1.1.2] - 2021-07-30

### Changed

- Affix all dependency versions.

## [1.1.1] - 2021-07-30

### Changed

- Improve NatSpec comments in `IHifiPool.sol`.

## [1.1.0] - 2021-07-29

### Added

- Inherit from `IErc20Permit` in `IHifiPool.sol`.
- New constant function `getMintParams` in `HifiPool.sol`.

### Changed

- Keywords in `package.json`.
- Source `hTokenRequired` and `poolTokensMinted` via the `getMintParams` function.
- Various rewordings in code comments.

## [1.0.0] - 2021-06-28

### Added

- First release of the package.

[1.5.0]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.4.0...@hifi/amm@1.5.0
[1.4.0]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.3.0...@hifi/amm@1.4.0
[1.3.0]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.2.1...@hifi/amm@1.3.0
[1.2.1]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.2.0...@hifi/amm@1.2.1
[1.2.0]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.1.2...@hifi/amm@1.2.0
[1.1.2]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.1.1...@hifi/amm@1.1.2
[1.1.1]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.1.0...@hifi/amm@1.1.1
[1.1.0]: https://github.com/hifi-finance/hifi/compare/@hifi/amm@1.0.0...@hifi/amm@1.1.0
[1.0.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/amm@1.0.0
