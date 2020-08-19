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
    await run("clean");
  },
  skipFiles: ["mocks", "test"],
};
