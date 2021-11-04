import { shouldBehaveLikeUniswapV2Call } from "./effects/uniswapV2Call";

export function shouldBehaveLikeCollateralFlashUniswapV2(): void {
  describe("uniswapV2Call", function () {
    shouldBehaveLikeUniswapV2Call();
  });
}
