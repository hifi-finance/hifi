const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html", "lcov"],
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
    /* one million ETH */
    default_balance_ether: 1000000,
    mnemonic: process.env.MNEMONIC,
  },
  skipFiles: ["external", "invariants", "scripts", "test"],
};
