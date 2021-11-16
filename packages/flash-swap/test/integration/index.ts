import { baseContext } from "../shared/contexts";
import { integrationTestFlashUniswapV2 } from "./flashUniswapV2/FlashUniswapV2";

baseContext("Integration Tests", function () {
  integrationTestFlashUniswapV2();
});
