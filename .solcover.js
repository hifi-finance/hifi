const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html", "lcov"],
  providerOptions: {
    // https://github.com/trufflesuite/ganache-core/issues/515
    _chainId: 1337,
    // One million ETH
    default_balance_ether: 1000000,
    mnemonic: process.env.MNEMONIC,
  },
};
