# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2021-08-13

### Added

- Ethers as a peer dependency.
- TypeChain bindings for IErc20 in the npm package bundle.
- TypeChain factories in the npm package bundle.

### Changed

- Upgrade to @hifi/amm@1.4.0 and @hifi/protocol@1.4.0.

## [1.2.0] - 2021-08-03

### Changed

- Ask the user to pass the address of the WETH contract when interacting with the `wrapEthAndDepositCollateral` and the
  `wrapEthAndDepositAndBorrowHTokenAndSellHToken` functions.
- Delete the interface function and storage variable `WETH_ADDRESS`.
- Upgrade to @hifi/amm@1.3.0.
- Upgrade to @hifi/protocol@1.3.0.

## [1.1.1] - 2021-08-03

YANKED.

### Changed

- Upgrade to @hifi/amm@1.2.1.

## [1.1.0] - 2021-08-03

YANKED.

### Changed

- Upgrade to @hifi/amm@1.2.0.
- Upgrade to @hifi/protocol@1.2.0.

### Fixed

- Include the `commons.ts` file in the `typechain` folder shipped to the npm registry.
- Max hToken amount in the `buyUnderlyingAndAddLiquidity` function.

## [1.0.0] - 2021-07-31

YANKED.

### Added

- First release of the package.

[1.3.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/proxy-target@1.3.0
[1.2.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/proxy-target@1.2.0
[1.1.1]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/proxy-target@1.1.1
[1.1.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/proxy-target@1.1.0
[1.0.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/proxy-target@1.0.0
