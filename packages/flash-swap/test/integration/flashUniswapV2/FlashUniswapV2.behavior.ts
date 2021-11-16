import { shouldBehaveLikeUniswapV2Call } from "./effects/uniswapV2Call";

export function shouldBehaveLikeFlashUniswapV2(): void {
  describe("uniswapV2Call", function () {
    shouldBehaveLikeUniswapV2Call();
  });
}
