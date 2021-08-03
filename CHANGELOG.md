# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2021-08-03

### Changed

- Disable the Solidity compiler metadata hash.
- Upgrade to @hifi/protocol@1.2.0.

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

[1.2.0]: https://github.com/hifi-finance/hifi-amm/releases/tag/v1.2.0
[1.1.2]: https://github.com/hifi-finance/hifi-amm/releases/tag/v1.1.2
[1.1.1]: https://github.com/hifi-finance/hifi-amm/releases/tag/v1.1.1
[1.1.0]: https://github.com/hifi-finance/hifi-amm/releases/tag/v1.1.0
[1.0.0]: https://github.com/hifi-finance/hifi-amm/releases/tag/v1.0.0
