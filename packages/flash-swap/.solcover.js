const rootSolCover = require("../../.solcover");

module.exports = {
  ...rootSolCover,
  skipFiles: [
    "test",
    "uniswap-v2/test",
    "uniswap-v2/IUniswapV2Pair.sol",
    "uniswap-v2/UniswapV2Factory.sol",
    "uniswap-v2/UniswapV2Pair.sol",
  ],
};
