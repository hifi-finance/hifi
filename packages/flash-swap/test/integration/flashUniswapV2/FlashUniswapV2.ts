import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeFlashUniswapV2 } from "./FlashUniswapV2.behavior";

export function integrationTestFlashUniswapV2(): void {
  describe("FlashUniswapV2", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        fintroller,
        flashUniswapV2,
        hToken,
        maliciousV2Pair,
        uniswapV2Pair,
        usdc,
        usdcPriceFeed,
        wbtc,
        wbtcPriceFeed,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.flashUniswapV2 = flashUniswapV2;
      this.contracts.fintroller = fintroller;
      this.contracts.hToken = hToken;
      this.contracts.maliciousV2Pair = maliciousV2Pair;
      this.contracts.uniswapV2Pair = uniswapV2Pair;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeFlashUniswapV2();
  });
}
