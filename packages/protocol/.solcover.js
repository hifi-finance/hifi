const rootSolCover = require("../../.solcover");

module.exports = {
  ...rootSolCover,
  skipFiles: ["external/", "oracles/SimplePriceFeed.sol", "oracles/StablecoinPriceFeed.sol", "test/"],
};
