# Hifi Protocol ![npm (scoped)](https://img.shields.io/npm/v/@hifi/protocol)

The core Hifi fixed-rate, fixed-term lending protocol. Hifi is a decentralized finance protocol that brings fixed-rate, fixed-term lending to Ethereum-based blockchains.

The build artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@hifi/protocol@latest/).

## Installation

With yarn:

```bash
$ yarn add @hifi/protocol
```

Or npm:

```bash
$ npm install @hifi/protocol
```

## Usage

The node package that you just installed contains both Solidity and JavaScript code. The former is the smart contracts
themselves; the latter, the smart contract ABIs and the TypeChain bindings.

### Solidity

The core Hifi protocol can only be compiled with Solidity v0.8.4 and above, because we are reverting with [custom
errors](https://blog.soliditylang.org/2021/04/21/custom-errors/) instead of reason strings.

```solidity
// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";

contract YourContract {
    // Find the address on https://docs.hifi.finance
    IBalanceSheetV2 balanceSheet = IBalanceSheetV2(0x...);

    function queryAccountLiquidity(address user) external view returns (uint256 excessLiquidity, shortfallLiquidity) {
        (excessLiquidity, shortfallLiquidity) = balanceSheet.getCurrentAccountLiquidity(user);
    }

    function queryCollateralAmount(address user, IErc20 collateral) external view returns (uint256 collateralAmount) {
        debtAmount = balanceSheet.getCollateralAmount(user, collateral);
    }

    function queryDebtAmount(address user, IHToken hToken) external view returns (uint256 debtAmount) {
        debtAmount = balanceSheet.getDebtAmount(user, hToken);
    }
}
```

### JavaScript

```javascript
import { getDefaultProvider } from "@ethersproject/providers";
import type { BalanceSheetV2__factory } from "@hifi/protocol/dist/types/factories/contracts/core/balance-sheet/BalanceSheetV2__factory";

async function queryAccountLiquidity() {
  const balanceSheetABI = BalanceSheetV2__factory.abi;
  const defaultProvider = getDefaultProvider();
  const balanceSheet = new BalanceSheetV2__factory("0x...", defaultProvider); // Find the address on https://docs.hifi.finance
  const user = "0x...";
  const accountLiquidity = await balanceSheet.getCurrentAccountLiquidity(user);
}
```

## License

[BUSL 1.1](./LICENSE.md) © Mainframe Group Inc.
