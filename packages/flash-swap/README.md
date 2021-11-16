# Hifi Flash Swap ![npm (scoped)](https://img.shields.io/npm/v/@hifi/flash-swap)

Flash swap implementations for liquidating underwater accounts. We can currently source liquidity only from Uniswap V2
and its forks.

The build artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@hifi/flash-swap@latest/).

## Install

With yarn:

```bash
$ yarn add @hifi/flash-swap
```

Or npm:

```bash
$ npm install @hifi/flash-swap
```

## Usage

The node package that you just installed contains both Solidity and JavaScript code. The former represents the smart contracts
themselves; the latter, the smart contract ABIs and the TypeChain bindings.

### Solidity

You are not supposed to import the smart contracts. Instead, you should interact with the Uniswap pool
directly. For example, with the [UniswapV2Pair](https://github.com/Uniswap/v2-core/blob/v1.0.1/contracts/UniswapV2Pair.sol)
contract you would call the `swap` function. Then, Uniswap will forward the call to the `FlashUniswapV2`
contract. You can read more about flash swaps work in Uniswap on
[docs.uniswap.org](https://docs.uniswap.org/protocol/V2/concepts/core-concepts/flash-swaps).

### JavaScript

Example for Uniswap V2:

```js
import { defaultAbiCoder } from "@ethersproject/abi";
import { getDefaultProvider } from "@ethersproject/providers";
import { parseUnits } from "@ethersproject/units";
import { UniswapV2Pair__factory } from "@hifi/flash-swap/dist/types/factories/UniswapV2Pair__factory";

async function flashSwap() {
  const defaultProvider = getDefaultProvider();
  const pair = new UniswapV2Pair__factory("0x...", defaultProvider);

  const token0Amount = parseUnits("100", 18);
  const token1Amount = parseUnits("0", 18);
  const to = "0x..."; // Address of FlashUniswapV2, get it from https://docs.hifi.finance

  const borrower = "0x...";
  const hToken = "0x...";
  const turnout = parseUnits("1", 18);
  const data = defaultAbiCoder.encode(["address", "address", "uint256"], [borrower, hToken, turnout]);

  await pair.swap(token0Amount, token1Amount, to, data);
}
```

## License

[LGPL v3](./LICENSE.md) © Mainframe Group Inc.
