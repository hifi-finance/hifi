import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeHifiFlashUniswapV2 } from "./HifiFlashUniswapV2.behavior";

export function integrationTestHifiFlashUniswapV2(): void {
  describe("HifiFlashUniswapV2", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        fintroller,
        hToken,
        hifiFlashUniswapV2,
        oracle,
        usdc,
        usdcPriceFeed,
        uniswapV2Pair,
        wbtc,
        wbtcPriceFeed,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.fintroller = fintroller;
      this.contracts.hToken = hToken;
      this.contracts.hifiFlashUniswapV2 = hifiFlashUniswapV2;
      this.contracts.oracle = oracle;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.uniswapV2Pair = uniswapV2Pair;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeHifiFlashUniswapV2();
  });
}
