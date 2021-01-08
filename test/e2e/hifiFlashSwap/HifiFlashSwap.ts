import { hifiFlashSwapE2eFixture } from "../fixtures";
import { shouldBehaveLikeHifiFlashSwap } from "./HifiFlashSwap.behavior";

export function e2eTestHifiFlashSwap(): void {
  describe("HifiFlashSwap", function () {
    beforeEach(async function () {
      const { collateral, underlying, uniswapV2Pair } = await this.loadFixture(hifiFlashSwapE2eFixture);
      this.contracts.collateral = collateral;
      this.contracts.underlying = underlying;
      this.contracts.uniswapV2Pair = uniswapV2Pair;
    });

    shouldBehaveLikeHifiFlashSwap();
  });
}
