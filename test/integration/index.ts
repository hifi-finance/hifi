import { baseContext } from "../shared/contexts";
import { integrationTestHifiFlashUniswapV2 } from "./hifiFlashUniswapV2/HifiFlashUniswapV2";

baseContext("Integration Tests", function () {
  integrationTestHifiFlashUniswapV2();
});
