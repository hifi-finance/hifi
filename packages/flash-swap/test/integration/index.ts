import { baseContext } from "../shared/contexts";
import { integrationTestCollateralFlashUniswapV2 } from "./collateralFlashUniswapV2/CollateralFlashUniswapV2";
import { integrationTestUnderlyingFlashUniswapV2 } from "./underlyingFlashUniswapV2/UnderlyingFlashUniswapV2";

baseContext("Integration Tests", function () {
  integrationTestCollateralFlashUniswapV2();
  integrationTestUnderlyingFlashUniswapV2();
});
