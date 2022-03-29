# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## [1.10.0] - 2022-03-29

### Changed

- Refactor the directory trees in the generated types.
- Refactor the ethers factories as per the latest typechain output.
- Upgrade to the latest ethers packages.

### Removed

- Remove types for `Erc20`, `Erc20Permit`, `IAggregatorV3` and `Ownable`.

## [1.9.0] - 2022-03-16

### Changed

- Change the `amount` argument to `value` in the `permit` function of the `Erc20Permit` contract.
- Change the license from LGPL v3 to BUSL v1.1.
- Switch from `@paulrberg/contracts` to `@prb/contracts`.
- Switch from `prb-math` to `@prb/math`.

## [1.8.2] - 2022-03-04

### Changed

- Allow underlying deposits after maturation in the `HToken` contract.

## [1.8.1] - 2022-03-04

### Fixed

- Use the correct `onlyInitializing` modifier in `OwnableUpgradeable`.

## [1.8.0] - 2022-03-03

### Added

- Deposit underlying functionality in `HToken` and associated permissions in `Fintroller`.
- Fintroller address as addition constructor argument in `HToken`.
- New `BalanceSheetV2` contract, which upgrades `BalanceSheetV1`. This contract features a new `setFintroller` function.

### Changed

- Emit both current time and maturity time when reverting with the `BondNotMatured` custom error.
- Improve wording in README and NatSpec comments.
- Mark the init function as `internal` in `OwnableUpgradeable`.
- Move the custom errors in the smart contract interface files.
- Rename the `__OwnableUpgradeable__init` function to `__Ownable_init`.
- Turn the `Fintroller` into a non-upgradeable contract.
- Upgrade to `@openzeppelin/contracts-upgradeable` v4.5.2.
- Use hyphen-case instead of camelCase for directory names.
- Use the latest `onlyInitializable` modifier instead of `initializer`.
- Use `underlyingAmount` instead of `hTokenAmount` in the `redeem` function in the `HToken`.

### Fixed

- Emit correct arguments in `RepayBorrow` event, fixing [#162](https://github.com/paulrberg/create-eth-app/issues/162))

### Removed

- All `*.d.ts` type files.
- `SFintrollerV1` contract.
- `supplyUnderlying` function in `HToken`.

## [1.7.1] - 2021-10-25

### Changed

- Rename `supplyUnderlyingAmount` argument to `underlyingAmount` in the `supplyUnderlying` function in the `HToken` contract.
- Make token amounts normalizations and denormalizations more accurate by using `mul` and `div` functions from PRBMath.

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

[1.10.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.8.2...@hifi/protocol@1.10.0
[1.9.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.8.2...@hifi/protocol@1.9.0
[1.8.2]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.8.1...@hifi/protocol@1.8.2
[1.8.1]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.8.0...@hifi/protocol@1.8.1
[1.8.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.7.1...@hifi/protocol@1.8.0
[1.7.1]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.7.0...@hifi/protocol@1.7.1
[1.7.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.6.0...@hifi/protocol@1.7.0
[1.6.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.5.0...@hifi/protocol@1.6.0
[1.5.0]: https://github.com/hifi-finance/hifi/compare/@hifi/protocol@1.4.0...@hifi/protocol@1.5.0
[1.4.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/protocol@1.4.0
