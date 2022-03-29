# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2022-03-29

### Changed

### Changed

- Refactor the directory trees in the generated types.
- Refactor the ethers factories as per the latest typechain output.
- Upgrade to the latest ethers packages.
- Upgrade to `@hifi/amm` v1.10.1.
- Upgrade to `@hifi/protocol` v1.10.0.

### Removed

- Remove types for `IErc20`.

## [1.7.1] - 2022-03-16

### Changed

- Upgrade to `@hifi/amm` v1.9.1.
- Upgrade to `@hifi/protocol` v1.9.0.

## [1.7.0] - 2022-03-08

### Added

- An `underlyingAmount` argument to `redeem` function.

### Changed

- Improve wording in README and NatSpec comments.
- Rewrite the proxy target to conform to the latest API of the Hifi protocol.
- Upgrade to `@hifi/amm` v1.8.2.
- Upgrade to `@hifi/protocol` v1.8.2.
- Upgrade to `@openzeppelin/contracts-upgradeable` v4.5.2.
- The `redeemHToken` function and its derivatives into `redeem`.
- The `underlyingAsCollateral` wording into just `underlying`.
- The `supplyUnderlying` function and its derivatives into `depositUnderlying`.

### Removed

- All `*.d.ts` type files.

## [1.6.1] - 2021-10-25

### Changed

- Upgrade to `@hifi/amm` v1.7.1.
- Upgrade to `@hifi/protocol` v1.7.1.

### Fixed

- Transfer correct amount of hToken dust in `buyHTokenAndAddLiquidity` function.

## [1.6.0] - 2021-10-20

### Changed

- Mark `@ethersproject/abi`, `@ethersproject/bytes` and `@ethersproject/providers` as normal deps instead of dev deps.
- Move types from `typechain` directory to `dist/types`.
- Ship declaration maps and source maps with the npm package.
- Upgrade to `@hifi/amm` v1.7.0.
- Upgrade to `@hifi/protocol` v1.7.0.
- Upgrade to `@paulrberg/contracts` v3.6.1.
- Upgrade to `ethers` v5.5.1.
- Upgrade to Solidity v0.8.9.

### Fixed

- Check zero edge cases in the `buyHToken` and `sellHToken` functions in the `HifiPool` contract.

## [1.5.0] - 2021-09-24

### Changed

- Declutter README and add usage guides.
- Polish the NatSpec comments.
- Sync peer dependencies.
- Update year in LICENSE.
- Upgrade to `@hifi/protocol` v1.6.0.
- Upgrade to `@hifi/amm` v1.6.0.
- Upgrade to `@paulrberg/contracts` v3.6.0.

## [1.4.0] - 2021-09-16

### Added

- `depositUnderlyingAsCollateralAndBorrowHTokenAndAddLiquidity` function.
- `removeLiquidityAndRepayBorrowAndWithdrawCollateral` function.
- `repayAmount` argument to the `removeLiquidityAndRepayBorrowAndWithdrawCollateral` function.

### Changed

- Mark `withdrawCollateral` function as public.
- Move amount normalization computations in internal function.
- Polish NatSpec comments.
- Upgrade to `ethers` v5.4.6.
- Upgrade to `@hifi/amm` v1.5.0.
- Upgrade to `@hifi/protocol` v1.5.0.
- Upgrade to `@paulrberg/contracts` v3.5.2.
- Use Solidity compiler v0.8.7.

### Fixed

- Call `getQuoteForSellingHToken` instead of `getQuoteForSellingUnderlying` in the `removeLiquidityAndSellHToken` function.
- Check debt amount before repaying borrow in `buyHTokenAndRepayBorrow` function.

### Removed

- `removeLiquidityAndSellUnderlyingAndRepayBorrow` function.

## [1.3.1] - 2021-08-13

### Fixed

- Sync peer dependency versions of @hifi/amm and @hifi/protocol.

## [1.3.0] - 2021-08-13

### Added

- Ethers as a peer dependency.
- New `depositCollateralAndBorrowHTokenAndAddLiquidity` function.
- TypeChain bindings for IErc20 in the npm package bundle.
- TypeChain factories in the npm package bundle.

### Changed

- Mark `borrowHTokenAndAddLiquidity` function as public.
- Refactor `collateralAmount` to `depositAmount`.
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

[1.8.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.7.1...@hifi/proxy-target@1.8.0
[1.7.1]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.7.0...@hifi/proxy-target@1.7.1
[1.7.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.6.1...@hifi/proxy-target@1.7.0
[1.6.1]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.6.0...@hifi/proxy-target@1.6.1
[1.6.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.5.0...@hifi/proxy-target@1.6.0
[1.5.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.4.0...@hifi/proxy-target@1.5.0
[1.4.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.3.1...@hifi/proxy-target@1.4.0
[1.3.1]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.3.0...@hifi/proxy-target@1.3.1
[1.3.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.2.0...@hifi/proxy-target@1.3.0
[1.2.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.1.1...@hifi/proxy-target@1.2.0
[1.1.1]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.1.0...@hifi/proxy-target@1.1.1
[1.1.0]: https://github.com/hifi-finance/hifi/compare/@hifi/proxy-target@1.0.0...@hifi/proxy-target@1.1.0
[1.0.0]: https://github.com/hifi-finance/hifi/releases/tag/@hifi/proxy-target@1.0.0
