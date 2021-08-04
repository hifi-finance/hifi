import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-packager";
import "solidity-coverage";

import "./tasks/clean";
import "./tasks/deployers";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";

import { GAS_LIMIT_HARDHAT } from "./helpers/constants";
import { getEnvVar } from "./helpers/env";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  hardhat: 31337,
  goerli: 5,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Ensure that we have the environment variables we need.
const infuraApiKey: string = getEnvVar("INFURA_API_KEY");
const mnemonic: string = getEnvVar("MNEMONIC");

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
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

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: ["GodModeErc20", "SimplePriceFeed"],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      allowUnlimitedContractSize: true,
      blockGasLimit: GAS_LIMIT_HARDHAT.toNumber(),
      chainId: chainIds.hardhat,
      gas: GAS_LIMIT_HARDHAT.toNumber(), // https://github.com/nomiclabs/hardhat/issues/660#issuecomment-715897156
    },
    goerli: createTestnetConfig("goerli"),
    kovan: createTestnetConfig("kovan"),
    rinkeby: createTestnetConfig("rinkeby"),
    ropsten: createTestnetConfig("ropsten"),
  },
  packager: {
    contracts: [
      "BalanceSheetV1",
      "ChainlinkOperator",
      "Erc20",
      "Erc20Permit",
      "FintrollerV1",
      "HToken",
      "IAggregatorV3",
      "IBalanceSheetV1",
      "IChainlinkOperator",
      "IErc20",
      "IErc20Permit",
      "IFintrollerV1",
      "IHToken",
      "IOwnableUpgradeable",
      "OwnableUpgradeable",
      "SimplePriceFeed",
      "StablecoinPriceFeed",
    ],
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
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
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
