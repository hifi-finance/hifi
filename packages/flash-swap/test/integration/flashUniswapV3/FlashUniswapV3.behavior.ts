import { shouldBehaveLikeUniswapV3SwapCallback } from "./effects/uniswapV3SwapCallback";

export function shouldBehaveLikeFlashUniswapV3(): void {
  describe("uniswapV3SwapCallback", function () {
    shouldBehaveLikeUniswapV3SwapCallback();
  });
}
