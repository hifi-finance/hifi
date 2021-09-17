# Hifi Protocol ![npm (scoped)](https://img.shields.io/npm/v/@hifi/protocol)

The core Hifi fixed-rate, fixed-term lending protocol. Hifi enables the creation of zero-coupon bonds on EVM-compatible chains.

The build artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@hifi/protocol@latest/).

## Install

With yarn:

```bash
$ yarn add @hifi/protocol
```

Or npm:

```bash
npm install @hifi/protocol
```

## Usage

The node package that you just installed contains both Solidity and JavaScript code. The former represents the smart contracts
themselves; the latter, the Hardhat artifacts and the TypeChain bindings.

### Solidity

The core Hifi protocol can only be compiled with Solidity v0.8.4 and above, because we are reverting with [custom
errors](https://blog.soliditylang.org/2021/04/21/custom-errors/) instead of reason strings.

```solidity
// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balanceSheet/IBalanceSheetV1.sol";

contract YourContract {

  // Get the address from https://docs.hifi.finance
  IBalanceSheetV1 balanceSheet = IBalanceSheetV1(0x...);

  function queryAccountLiquidity(address user) external view returns (uint256 excessLiquidity, shortfallLiquidity) {
    (excessLiquidity, shortfallLiquidity) = balanceSheet.getCurrentAccountLiquidity(user);
  }

  function queryCollateralAmount(address user, IErc20 collateral) external view returns (uint256 collateralAmount) {
    debtAmount = balanceSheet.getCollateralAmount(user, collateral);
  }

  function queryDebtAmount(address user, IHToken hToken) external view returns (uint256 debtAmount) {
    debtAmount = balanceSheet.getDebtAmount(user, hToken);
  }
```

### JavaScript

```ts
import { getDefaultProvider } from "@ethersproject/providers";
import { BalanceSheetV1__factory } from "@hifi/protocol/typechain/factories/BalanceSheet__factory";

async function queryAccountLiquidity() {
  const defaultProvider = getDefaultProvider();
  const balanceSheet = BalanceSheetV1__factory("0x...", defaultProvider); // Get the address from https://docs.hifi.finance
  const user = "0x...";
  const accountLiquidity = await balanceSheet.getCurrentAccountLiquidity(user);
}
```

## License

[LGPL v3](./LICENSE.md) © Mainframe Group Inc.
