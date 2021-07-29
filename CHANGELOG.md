# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/hifi-finance/hifi-amm/releases/tag/v1.0.0
