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
      mainnet: getEnvVar("ETHERSCAN_API_KEY"),
      goerli: getEnvVar("ETHERSCAN_API_KEY"),
      polygon: getEnvVar("POLYGONSCAN_API_KEY"),
      rinkeby: getEnvVar("ETHERSCAN_API_KEY"),
      ropsten: getEnvVar("ETHERSCAN_API_KEY"),
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
    goerli: getChainConfig("goerli", infuraApiKey, mnemonic),
    mainnet: getChainConfig("mainnet", infuraApiKey, mnemonic),
    "polygon-mainnet": getChainConfig("polygon-mainnet", infuraApiKey, mnemonic),
    rinkeby: getChainConfig("rinkeby", infuraApiKey, mnemonic),
    ropsten: getChainConfig("ropsten", infuraApiKey, mnemonic),
  },
  packager: {
    contracts: ["FlashUniswapV2", "IFlashUniswapV2", "IUniswapV2Callee", "IUniswapV2Pair", "UniswapV2Pair"],
    includeFactories: true,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999_999,
          },
        },
      },
      {
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
    ],
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
