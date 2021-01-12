import shouldBehaveLikeUniswapV2Call from "./effects/uniswapV2Call";

export function shouldBehaveLikeHifiFlashSwap(): void {
  describe("uniswapV2Call", function () {
    shouldBehaveLikeUniswapV2Call();
  });
}
