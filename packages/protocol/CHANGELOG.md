# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2021-09-16

### Added

- `getRepayAmount` function in the `BalanceSheetV1` contract.
- TypeChain factories in npm package bundle.

### Changed

- Improve wording in NatSpec comments.
- Refactor all test `burn` and `mint` functions to `__godMode_burn` and `__godMode_mint`
- Set the list of non-recoverable tokens in the `HToken` contract constructor.
- Upgrade to `ethers` v5.4.6.
- Upgrade to `@paulrberg/contracts` v3.5.2.
- Upgrade to `@openzeppelin/contracts-upgradeable` v4.3.1.
- Upgrade to Solidity compiler v0.8.7.
- Use LGPL v3 license for all contracts.
- Wrap the precision scalar in `unchecked` blocks to save gas.

### Fixed

- Do not return zero when the liquidation incentive is 100% in `getSeizableCollateralAmount` function in the
  `BalanceSheetV1` contract.
- Typos in NatSpec comments.

## [1.4.0] - 2021-08-12

### Added

- Ethers as a peer dependency.
- TypeChain factories in the npm package bundle.

### Changed

- Improve wording in NatSpec comments for `getHypotheticalAccountLiquidity` function.

### Fixed

- Zero edge case in `getSeizableCollateralAmount` function.

[1.5.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.4.0...@hifi/protocol@1.5.0
[1.4.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/protocol@1.4.0
