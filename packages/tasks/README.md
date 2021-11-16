# Hifi Tasks

Hardhat tasks for the Hifi smart contracts.

A note on the deploy tasks. This package cannot deploy upgradeable contracts, because OpenZeppelin's upgrades plugin
[validates](https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/402) the compiler cache before deploying the
proxies.

## Install

This package is not meant to be installed by any other package, not even a local package in this monorepo.

## Usage

### Deploy ChainlinkOperator

```sh
yarn hardhat --network "..." deploy:contract:chainlink-operator
```

### Deploy FlashUniswapV2

```sh
yarn hardhat --network "..." deploy:contract:flash-uniswap-v2 --balance-sheet "0x..." --uni-v2-factory "0x..." --uni-v2-pair-init-code-hash "0x..."
```

### Deploy HifiPool

```sh
yarn hardhat --network "..." deploy:contract:hifi-pool --name "..." --symbol "..." --h-token "0x..." --hifi-pool-registry "0x..."
```

### Deploy HifiPoolRegistry

```sh
yarn hardhat --network "..." deploy:contract:hifi-pool-registry
```

### Deploy HifiProxyTarget

```sh
yarn hardhat --network "..." deploy:contract:hifi-proxy-target
```

### Deploy HToken

```sh
yarn hardhat --network "..." deploy:contract:h-token --name "..." --symbol "..." --maturity "..." --balance-sheet "0x..." ---underlying "0x..."
```

### Deploy SimplePriceFeed

```sh
yarn hardhat --network "..." deploy:contract:simple-price-feed --description "..."
```

### Deploy StablecoinPriceFeed

```sh
yarn hardhat --network "..." deploy:stablecoin-price-feed --price "..." --description "..."
```

### Init AddLiquidity

```sh
yarn hardhat --network "..." init:add-liquidity --hifi-pool "0x..." --pool-underlying-amount "..." --supply-underlying-amount "..."
```
