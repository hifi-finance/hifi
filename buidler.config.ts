import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });

import { usePlugin } from "@nomiclabs/buidler/config";

import buidlerEvmAccounts from "./helpers/accounts";
import { blockGasLimit, callGasLimit, chainIds } from "./helpers/constants";
import { ExtendedBuidlerConfig, ExtendedNetworkConfig } from "./@types";

import "./tasks/accounts";
import "./tasks/clean";
import "./tasks/typechain";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("buidler-gas-reporter");
usePlugin("solidity-coverage");

/* Ensure that we have all the environment variables we need. */
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}

let infuraApiKey: string;
if (!process.env.INFURA_API_KEY) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
} else {
  infuraApiKey = process.env.INFURA_API_KEY;
}

/* Used when deploying contracts to the testnet. */
function createTestnetConfig(network: keyof typeof chainIds): ExtendedNetworkConfig {
  const url: string = "https://" + network + ".infura.io/v3/" + infuraApiKey;
  return {
    accounts: {
      count: 6,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
  };
}

const config: ExtendedBuidlerConfig = {
  defaultNetwork: "buidlerevm",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: ["Erc20Mintable", "SimpleUniswapAnchoredView", "TestOraclePriceUtils"],
    src: "./contracts",
  },
  networks: {
    buidlerevm: {
      accounts: buidlerEvmAccounts,
      allowUnlimitedContractSize: true,
      blockGasLimit: blockGasLimit.toNumber(),
      chainId: chainIds.buidlerEvm,
      gas: callGasLimit.toNumber() /* https://github.com/nomiclabs/hardhat/issues/660#issuecomment-715897156 */,
    },
    coverage: {
      chainId: chainIds.ganache,
      url: "http://127.0.0.1:8555",
    },
    ganache: {
      chainId: chainIds.ganache,
      url: "http://127.0.0.1:8545",
    },
    goerli: createTestnetConfig("goerli"),
    rinkeby: createTestnetConfig("rinkeby"),
    ropsten: createTestnetConfig("ropsten"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    coverage: "./coverage",
    coverageJson: "./coverage.json",
    cryticExport: "./crytic-export",
    sources: "./contracts",
    tests: "./test",
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    version: "0.7.4",
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
