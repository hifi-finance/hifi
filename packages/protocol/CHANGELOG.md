# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2021-10-20

### Changed

- Mark `@ethersproject/abi`, `@ethersproject/bytes` and `@ethersproject/providers` as normal deps instead of dev deps.
- Move types from `typechain` directory to `dist/types`.
- Rename `HToken__MaturityPast` custom error to `HToken__MaturityPassed`.
- Ship declaration maps and source maps with the npm package.
- Upgrade to `@paulrberg/contracts` v3.6.1.
- Upgrade to `ethers` v5.5.1.
- Upgrade to `prb-math` v2.4.0 and remove `prb-math.js` dev dep.
- Upgrade to Solidity v0.8.9.

### Fixed

- Compare collateral ceiling to contract balance in the `BalanceSheetV1` contract.
- Revert when the calculated underlying amount is zero in the `redeem` function in the `HToken` contract.

## Removed

- `artifacts` from npm package.

## [1.6.0] - 2021-09-24

### Added

- Collateral ceilings.

### Changed

- Declutter README and add usage guides.
- Polish the NatSpec comments.
- Refactor `DEFAULT_COLLATERALIZATION_RATIO` to `DEFAULT_COLLATERAL_RATIO` in the `SFintrollerV1` contract.
- Refactor `COLLATERALIZATION_RATIO_LOWER_BOUND` to `COLLATERAL_RATIO_LOWER_BOUND` in the `SFintrollerV1` contract.
- Refactor `COLLATERALIZATION_RATIO_UPPER_BOUND` to `COLLATERAL_RATIO_UPPER_BOUND` in the `SFintrollerV1` contract.
- Refactor `collateralizationRatio` to `collateralRatio` in the `BalanceSheetV1` and the `FintrollerV1` contracts.
- Refactor `collateralizationRatio` to `ratio` in the `Collateral` struct in the `SFintrollerV1` contract.
- Sync peer dependencies.
- The `hypothetical` prefix to `new` in the variables used in the `BalanceSheetV1` contract.
- Update year in LICENSE.
- Upgrade to `@openzeppelin/contracts-upgradeable` v4.3.2.
- Upgrade to `@paulrberg/contracts` v3.6.0.
- Upgrade to `prb-math` v2.3.0.

## [1.5.0] - 2021-09-16

### Added

- `getRepayAmount` function in the `BalanceSheetV1` contract.
- TypeChain factories in npm package bundle.

### Changed

- Improve wording in NatSpec comments.
- Refactor all test `burn` and `mint` functions to `__godMode_burn` and `__godMode_mint`.
- Set the list of non-recoverable tokens in the `HToken` contract constructor.
- Upgrade to `ethers` v5.4.6.
- Upgrade to `@paulrberg/contracts` v3.5.2.
- Upgrade to `@openzeppelin/contracts-upgradeable` v4.3.1.
- Use Solidity v0.8.7.
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

[1.7.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.6.0...@hifi/protocol@1.7.0
[1.6.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.5.0...@hifi/protocol@1.6.0
[1.5.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.4.0...@hifi/protocol@1.5.0
[1.4.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/protocol@1.4.0
