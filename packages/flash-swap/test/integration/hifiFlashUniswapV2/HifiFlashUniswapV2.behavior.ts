import { shouldBehaveLikeUniswapV2Call } from "./effects/uniswapV2Call";

export function shouldBehaveLikeHifiFlashUniswapV2(): void {
  describe("uniswapV2Call", function () {
    shouldBehaveLikeUniswapV2Call();
  });
}
