import { baseContext } from "../shared/contexts";
import { integrationTestHifiFlashUniswapV2 } from "./hifiFlashUniswapV2/HifiFlashUniswapV2";
import { integrationTestHifiFlashUniswapV2Underlying } from "./hifiFlashUniswapV2Underlying/HifiFlashUniswapV2Underlying";

baseContext("Integration Tests", function () {
  integrationTestHifiFlashUniswapV2();
  integrationTestHifiFlashUniswapV2Underlying();
});
