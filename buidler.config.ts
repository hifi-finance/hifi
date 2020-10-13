import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });

import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";
import { ChainIds, DefaultBlockGasLimit, DefaultPrivateKeys } from "./utils/constants";
import { BuidlerNetworkAccount, HDAccountsConfig } from "@nomiclabs/buidler/types";
import "./tasks/accounts";
import "./tasks/clean";
import "./tasks/typechain";

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("solidity-coverage");

/**
 * Six accounts with 10,000 ETH each. We need to use these instead of the default
 * Buidler accounts because some tests depend on hardcoded private keys.
 *
 * 0x5a2E001C52Ba44e501c35B769822859cF83A23D7
 * 0xf3B2b6f3fB19e5D6541ecF86bBFfe0126880Bb0c
 * 0x7523b47C56f673EA1CaFd4672cA9245Ad1bcE03D
 * 0x59204B9dA861F9C1EC3D728af305D5EEf4Db64E8
 * 0x9e705a94E91736B48f594C603d3Fe0805B0Ca4A0
 * 0xeB7Ba84d23C8484A5dec9E136e4ccFEaf35378DB
 */
function createBuidlerEvmAccounts(): BuidlerNetworkAccount[] {
  const tenThousandEther: string = "10000000000000000000000";
  return [
    {
      balance: tenThousandEther,
      privateKey: DefaultPrivateKeys.Admin,
    },
    {
      balance: tenThousandEther,
      privateKey: DefaultPrivateKeys.Brad,
    },
    {
      balance: tenThousandEther,
      privateKey: DefaultPrivateKeys.Eve,
    },
    {
      balance: tenThousandEther,
      privateKey: DefaultPrivateKeys.Grace,
    },
    {
      balance: tenThousandEther,
      privateKey: DefaultPrivateKeys.Lucy,
    },
    {
      balance: tenThousandEther,
      privateKey: DefaultPrivateKeys.Mark,
    },
  ];
}

/**
 * @dev You must have a `.env` file. Follow the example in `.env.example`.
 * @param {string} network The name of the testnet
 */
function createNetworkConfig(network?: string): { accounts: HDAccountsConfig; url: string | undefined } {
  if (!process.env.MNEMONIC) {
    throw new Error("Please set your MNEMONIC in a .env file");
  }

  if (!process.env.INFURA_API_KEY) {
    throw new Error("Please set your INFURA_API_KEY");
  }

  return {
    accounts: {
      count: 6,
      initialIndex: 0,
      mnemonic: process.env.MNEMONIC,
      path: "m/44'/60'/0'/0",
    },
    url: network ? `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}` : undefined,
  };
}

const config: BuidlerConfig = {
  defaultNetwork: "buidlerevm",
  networks: {
    buidlerevm: {
      accounts: createBuidlerEvmAccounts(),
      allowUnlimitedContractSize: true,
      blockGasLimit: DefaultBlockGasLimit.toNumber(),
      chainId: ChainIds.BuidlerEvm,
      gas: DefaultBlockGasLimit.toNumber(),
    },
    coverage: {
      chainId: ChainIds.Ganache,
      url: "http://127.0.0.1:8555",
    },
    goerli: {
      ...createNetworkConfig("goerli"),
      chainId: ChainIds.Goerli,
    },
    kovan: {
      ...createNetworkConfig("kovan"),
      chainId: ChainIds.Kovan,
    },
    rinkeby: {
      ...createNetworkConfig("rinkeby"),
      chainId: ChainIds.Rinkeby,
    },
    ropsten: {
      ...createNetworkConfig("ropsten"),
      chainId: ChainIds.Ropsten,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    coverage: "./coverage",
    coverageJson: "./coverage.json",
    root: "./",
    sources: "./contracts",
    tests: "./test",
  },
  solc: {
    /* Disable the optimizer when debugging: https://buidler.dev/buidler-evm/#solidity-optimizer-support */
    optimizer: {
      enabled: true,
      runs: 200,
    },
    version: "0.7.1",
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
