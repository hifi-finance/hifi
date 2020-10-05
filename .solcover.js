const shell = require("shelljs");

/* The environment variables are loaded in buidler.config.ts */
const mnemonic = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

module.exports = {
  istanbulReporter: ["html"],
  mocha: {
    delay: false,
  },
  onCompileComplete: async function (_config) {
    await run("typechain");
  },
  onIstanbulComplete: async function (_config) {
    /* We need to do this because solidity-coverage generates bespoke artifacts. */
    shell.rm("-rf", "./artifacts");
    shell.rm("-rf", "./typechain");
  },
  providerOptions: {
    /* https://github.com/trufflesuite/ganache-core/issues/515 */
    _chainId: 1337,
    /* 100 hundred million ETH */
    default_balance_ether: 100000000,
    mnemonic,
  },
  skipFiles: [
    "erc20/Erc20.sol",
    "erc20/Erc20Interface.sol",
    "erc20/Erc20Storage.sol",
    "erc20/SafeErc20.sol",
    "math",
    "test",
    "utils/Address.sol",
    "utils/Admin.sol",
    "utils/AdminInterface.sol",
    "utils/AdminStorage.sol",
    "utils/ErrorReporter.sol",
    "utils/Orchestratable.sol",
    "utils/OrchestratableInterface.sol",
    "utils/OrchestratableStorage.sol",
    "utils/ReentrancyGuard.sol",
  ],
};
