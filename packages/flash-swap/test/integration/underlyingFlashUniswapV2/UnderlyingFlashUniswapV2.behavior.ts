import { shouldBehaveLikeUniswapV2Call } from "./effects/uniswapV2Call";

export function shouldBehaveLikeUnderlyingFlashUniswapV2(): void {
  describe("uniswapV2Call", function () {
    shouldBehaveLikeUniswapV2Call();
  });
}
