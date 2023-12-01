import { getChainConfig, getEnvVar } from "@hifi/helpers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import { config as dotenvConfig } from "dotenv";
import "hardhat-packager";
import type { HardhatUserConfig } from "hardhat/config";
import { relative, resolve } from "path";
import "solidity-coverage";
import "solidity-docgen";

import "./tasks/deploy";
import "./tasks/init";

dotenvConfig({ path: resolve(__dirname, "..", "..", ".env") });

// Ensure that we have the environment variables we need.
const infuraApiKey: string = getEnvVar("INFURA_API_KEY");
const mnemonic: string = getEnvVar("MNEMONIC");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  docgen: {
    templates: "../../templates",
    pages: (_item, file) => {
      return file.absolutePath.startsWith("contracts")
        ? relative("contracts", file.absolutePath).replace(".sol", ".md")
        : undefined;
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: getEnvVar("ARBISCAN_API_KEY"),
      avalanche: getEnvVar("SNOWTRACE_API_KEY"),
      bsc: getEnvVar("BSCSCAN_API_KEY"),
      mainnet: getEnvVar("ETHERSCAN_API_KEY"),
      optimisticEthereum: getEnvVar("OPTIMISM_API_KEY"),
      polygon: getEnvVar("POLYGONSCAN_API_KEY"),
      polygonMumbai: getEnvVar("POLYGONSCAN_API_KEY"),
      sepolia: getEnvVar("ETHERSCAN_API_KEY"),
    },
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
    arbitrum: getChainConfig("arbitrum-mainnet", infuraApiKey, mnemonic),
    avalanche: getChainConfig("avalanche", infuraApiKey, mnemonic),
    bsc: getChainConfig("bsc", infuraApiKey, mnemonic),
    mainnet: getChainConfig("mainnet", infuraApiKey, mnemonic),
    optimism: getChainConfig("optimism-mainnet", infuraApiKey, mnemonic),
    "polygon-mainnet": getChainConfig("polygon-mainnet", infuraApiKey, mnemonic),
    "polygon-mumbai": getChainConfig("polygon-mumbai", infuraApiKey, mnemonic),
    sepolia: getChainConfig("sepolia", infuraApiKey, mnemonic),
  },
  packager: {
    contracts: ["HifiPool", "HifiPoolRegistry", "IHifiPool", "IHifiPoolRegistry"],
    includeFactories: true,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.12",
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
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
