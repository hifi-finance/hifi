# Hifi Proxy Target ![npm (scoped)](https://img.shields.io/npm/v/@hifi/proxy-target)

DSProxy target contract with stateless scripts.

The build artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@hifi/proxy-target@latest/).

## Installation

With yarn:

```bash
$ yarn add @hifi/proxy-target
```

Or npm:

```bash
$ npm install @hifi/proxy-target
```

## Usage

The node package that you just installed contains both Solidity and JavaScript code. The former is the smart contracts
themselves; the latter, the smart contract ABIs and the TypeChain bindings.

### Solidity

You will likely never need to interact with the smart contracts from Solidity. Though for the sake of completeness, here is a code snippet for how to do that:

```solidity
// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "@hifi/proxy-target/contracts/IHifiProxyTarget.sol";
import "@hifi/protocol/contracts/core/balance-sheet/IBalanceSheetV2.sol";

contract YourContract {
    // Find the address on https://docs.hifi.finance
    IHifiProxyTarget hifiProxyTarget = IHifiProxyTarget(0x...);

    function depositCollateral(
      IBalanceSheetV2 balanceSheet,
      IErc20 collateral,
      uint256 depositAmount
    ) external {
      hifiProxyTarget.depositCollateral(balanceSheet, collateral, depositAmount);
    }
}
```

### JavaScript

This code snippet shows how to interact with a DSProxy contract that is already deployed. For guidance on how to
deploy the DSProxy itself, refer to Maker's guide [Working with
DSProxy](https://github.com/makerdao/developerguides/blob/master/devtools/working-with-dsproxy/working-with-dsproxy.md).

```javascript
import { parseUnits } from "@ethersproject/units";
import { HifiProxyTarget__factory } from "@hifi/protocol/dist/types/factories/contracts/HifiProxyTarget__factory";

async function depositCollateral() {
  const signer = "..."; // Get hold of an ethers.js Signer
  const hifiProxyTargetFactory = new HifiProxyTarget__factory(signer); // Find the address on https://docs.hifi.finance
  const hifiProxyTarget = hifiProxyTargetFactory.attach("0x...");
  const balanceSheet = "0x...";
  const collateral = "0x...";
  const depositAmount = parseUnits("100", 18);
  const accountLiquidity = await hifiProxyTarget.depositCollateral(balanceSheet, collateral, depositAmount);
}
```

## License

[LGPL v3](./LICENSE.md) © Mainframe Group Inc.
