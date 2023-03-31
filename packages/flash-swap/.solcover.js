const rootSolCover = require("../../.solcover");

module.exports = {
  ...rootSolCover,
  skipFiles: [
    "test",
    "uniswap-v2/IUniswapV2Pair.sol",
    "uniswap-v2/UniswapV2Pair.sol",
    "uniswap-v2/test",
    "uniswap-v3/NoDelegateCall.sol",
    "uniswap-v3/UniswapV3Pool",
    "uniswap-v3/test",
  ],
};
