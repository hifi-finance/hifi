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
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      hardfork: process.env.CODE_COVERAGE ? "berlin" : "london", // https://github.com/sc-forks/solidity-coverage/issues/652
    },
    goerli: getChainConfig("goerli", infuraApiKey, mnemonic),
    "polygon-mainnet": getChainConfig("polygon-mainnet", infuraApiKey, mnemonic),
    rinkeby: getChainConfig("rinkeby", infuraApiKey, mnemonic),
    ropsten: getChainConfig("ropsten", infuraApiKey, mnemonic),
  },
  packager: {
    contracts: ["HifiFlashUniswapV2", "IHifiFlashUniswapV2", "IUniswapV2Pair", "UniswapV2Pair"],
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
        version: "0.8.6",
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
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;