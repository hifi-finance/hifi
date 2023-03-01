import { shouldBehaveLikeUniswapV3FlashCallback } from "./effects/uniswapV3SwapCallback";

export function shouldBehaveLikeFlashUniswapV3(): void {
  describe("uniswapV3FlashCallback", function () {
    shouldBehaveLikeUniswapV3FlashCallback();
  });
}
