import { baseContext } from "../shared/contexts";
import { integrationTestFlashUniswapV2 } from "./flashUniswapV2/FlashUniswapV2";

// TODO: uncomment all lines below when ready.
// import { integrationTestFlashUniswapV3 } from "./flashUniswapV3/FlashUniswapV3";

baseContext("Integration Tests", function () {
  integrationTestFlashUniswapV2();
  // integrationTestFlashUniswapV3();
});
