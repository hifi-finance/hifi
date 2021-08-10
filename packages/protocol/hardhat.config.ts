import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-packager";
import "solidity-coverage";

import "./tasks/clean";
import "./tasks/deployers";

import { resolve } from "path";

import { GAS_LIMITS } from "@hifi/constants";
import { getChainConfig, getEnvVar } from "@hifi/helpers";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "..", "..", ".env") });

const infuraApiKey: string = getEnvVar("INFURA_API_KEY");
const mnemonic: string = getEnvVar("MNEMONIC");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: getEnvVar("ETHERSCAN_API_KEY"),
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: ["GodModeErc20", "SimplePriceFeed", "StablecoinPriceFeed"],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      allowUnlimitedContractSize: true,
      blockGasLimit: GAS_LIMITS.hardhat.toNumber(),
      gas: GAS_LIMITS.hardhat.toNumber(), // https://github.com/nomiclabs/hardhat/issues/660#issuecomment-715897156
    },
    goerli: getChainConfig("goerli", infuraApiKey, mnemonic),
    "polygon-mainnet": getChainConfig("polygon-mainnet", infuraApiKey, mnemonic),
    rinkeby: getChainConfig("rinkeby", infuraApiKey, mnemonic),
    ropsten: getChainConfig("ropsten", infuraApiKey, mnemonic),
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
      "IOwnable",
      "IOwnableUpgradeable",
      "Ownable",
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
