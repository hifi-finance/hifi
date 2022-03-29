# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## [1.10.0] - 2022-03-29

### Changed

- Refactor the directory trees in the generated types.
- Refactor the ethers factories as per the latest typechain output.
- Upgrade to the latest ethers packages.
- Upgrade to `@hifi/protocol` v1.10.0.

### Removed

- Remove types for `Erc20`.

## [1.9.0] - 2022-03-16

### Changed

- Switch from `@paulrberg/contracts` to `@prb/contracts`.
- Upgrade to `@hifi/protocol` v1.9.0.

## [1.8.0] - 2022-03-04

## Changed

- Refer to "other token" as "collateral".
- Rewrite `FlashSwapUniswapV2` to conform to latest API of the Hifi protocol.
- Upgrade to `@hifi/protocol` v1.8.2.
- Upgrade to `@openzeppelin/contracts-upgradeable` v4.5.2.

## Removed

- All `*.d.ts` type files.
- Support for underlying-backed vaults in `FlashSwapUniswapV2`.

## [1.7.0] - 2021-11-25

### Added

- Allow collateral flash swap fee to be subsidized.
- Emit repay and subsidy amounts in the `FlashSwapCollateralAndLiquidateBorrow` event.

### Changed

- Generalize the computation in `getRepayAmount` to account for the case when the flash swap fee is paid in the same token.
- Order functions alphabetically.
- Polish the NatSpec comments.
- Remove the "internal" suffix in the internal functions names.
- Rename `FlashLiquidateBorrow` to `FlashSwapAndLiquidateBorrow`.
- Rename `InsufficientProfit` to `TurnoutNotSatisfied`.
- Rename `seizedCollateralAmount` to `seizeCollateralAmount`.
- Rename `subsidizedUnderlyingAmount` to `subsidyUnderlyingAmount`.
- Refactor the `getCollateralAndUnderlyingAmount` function to `getOtherTokenAndUnderlyingAmount`.
- Refactor the `HifiFlashUniswapV2` contract to `FlashUniswapV2`.

## [1.6.1] - 2021-10-25

### Changed

- Load vars in struct in `uniswapV2Call` function in the `HifiFlashUniswapV2` contract.
- Split the `mintAndLiquidateBorrow` function in two functions: `mintHTokensInternal` and `liquidateBorrowInternal`.
- Upgrade to `@hifi/protocol` v1.7.1.

### Fixed

- Calculation of `repayAmount` in `liquidateBorrowInternal` function in the `HifiFlashUniswapV2` contract.

## [1.6.0] - 2021-10-20

### Changed

- Mark `@ethersproject/abi`, `@ethersproject/bytes` and `@ethersproject/providers` as normal deps instead of dev deps.
- Move types from `typechain` directory to `dist/types`.
- Ship declaration maps and source maps with the npm package.
- Upgrade to `@hifi/protocol` v1.7.0.
- Upgrade to `@paulrberg/contracts` v3.6.1.
- Upgrade to `ethers` v5.5.1.
- Upgrade to Solidity v0.8.9.

### Fixed

- Check `mintedHTokenAmount` against `debtAmount` in the `HifiFlashUniswapV2` contract.

## Removed

- `artifacts` from npm package.

## [1.5.0] - 2021-09-24

### Changed

- Declutter README and add usage guides.
- Polish the NatSpec comments.
- Sync peer dependencies.
- Update year in LICENSE.
- Upgrade to `@hifi/protocol` v1.6.0.
- Upgrade to `@paulrberg/contracts` v3.6.0.

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

[1.10.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.9.0...@hifi/flash-swap@1.10.0
[1.9.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.8.0...@hifi/flash-swap@1.9.0
[1.8.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.7.0...@hifi/flash-swap@1.8.0
[1.7.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.6.1...@hifi/flash-swap@1.7.0
[1.6.1]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.6.0...@hifi/flash-swap@1.6.1
[1.6.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.5.0...@hifi/flash-swap@1.6.0
[1.5.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.4.0...@hifi/flash-swap@1.5.0
[1.4.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.3.1...@hifi/flash-swap@1.4.0
[1.3.1]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.3.0...@hifi/flash-swap@1.3.1
[1.3.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.2.0...@hifi/flash-swap@1.3.0
[1.2.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.1.0...@hifi/flash-swap@1.2.0
[1.1.0]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.0.1...@hifi/flash-swap@1.1.0
[1.0.1]: https://github.com/hifi-finance/hifi/compare/@hifi/flash-swap@1.0.0...@hifi/flash-swap@1.0.1
[1.0.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/flash-swap@1.0.0
