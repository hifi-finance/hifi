import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-packager";
import "solidity-coverage";

import "./tasks/clean";

import { resolve } from "path";

import { getChainConfig, getEnvVar } from "@hifi/helpers";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenvConfig({ path: resolve(__dirname, "..", "..", ".env") });

// Ensure that we have the environment variables we need.
const infuraApiKey: string = getEnvVar("INFURA_API_KEY");
const mnemonic: string = getEnvVar("MNEMONIC");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: getEnvVar("ETHERSCAN_API_KEY"),
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
    },
    localhost: {
      accounts: {
        mnemonic,
      },
      url: "http://localhost:8545",
    },
    goerli: getChainConfig("goerli", infuraApiKey, mnemonic),
    "polygon-mainnet": getChainConfig("polygon-mainnet", infuraApiKey, mnemonic),
    rinkeby: getChainConfig("rinkeby", infuraApiKey, mnemonic),
    ropsten: getChainConfig("ropsten", infuraApiKey, mnemonic),
  },
  packager: {
    contracts: [
      "Erc20",
      "Erc20Permit",
      "HifiPool",
      "HifiPoolRegistry",
      "IErc20",
      "IErc20Permit",
      "IHifiPool",
      "IHifiPoolRegistry",
      "IOwnable",
      "Ownable",
    ],
    includeFactories: true,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.7",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
