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
const uniswapV2CompilerSettings = {
  version: "0.5.16",
  settings: {
    optimizer: {
      enabled: true,
      runs: 999_999,
    },
  },
};
const uniswapV3CompilerSettings = {
  version: "0.7.6",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
  },
};
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
      allowUnlimitedContractSize: true,
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
    contracts: [
      "FlashUniswapV2",
      "FlashUniswapV3",
      "IFlashUniswapV2",
      "IFlashUniswapV3",
      "IUniswapV2Callee",
      "IUniswapV3SwapCallback",
      "IUniswapV2Pair",
      "IUniswapV3Pool",
      "UniswapV2Pair",
      "UniswapV3Pool",
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
    compilers: [
      uniswapV2CompilerSettings,
      uniswapV3CompilerSettings,
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
    overrides: {
      "@uniswap/v3-core/contracts/libraries/TickBitmap.sol": uniswapV3CompilerSettings,
      "@uniswap/v3-periphery/contracts/libraries/ChainId.sol": uniswapV3CompilerSettings,
      "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol": uniswapV3CompilerSettings,
    },
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
