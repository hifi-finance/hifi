const shell = require("shelljs");

module.exports = {
  istanbulReporter: ["html"],
  mocha: {
    delay: false,
  },
  onCompileComplete: async function (_config) {
    await run("typechain");
  },
  onIstanbulComplete: async function (_config) {
    /* We need to do this because solcover generates bespoke artifacts. */
    shell.rm("-rf", "./artifacts");
    shell.rm("-rf", "./typechain");
  },
  providerOptions: {
    default_balance_ether: 100000000,
  },
  skipFiles: ["erc20", "math", "test"],
};
