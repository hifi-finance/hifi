import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeHifiFlashUniswapV2Underlying } from "./HifiFlashUniswapV2Underlying.behavior";

export function integrationTestHifiFlashUniswapV2Underlying(): void {
  describe("HifiFlashUniswapV2Underlying", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        fintroller,
        hToken,
        hifiFlashUniswapV2Underlying,
        maliciousPair,
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
      this.contracts.hifiFlashUniswapV2Underlying = hifiFlashUniswapV2Underlying;
      this.contracts.maliciousPair = maliciousPair;
      this.contracts.oracle = oracle;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.uniswapV2Pair = uniswapV2Pair;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeHifiFlashUniswapV2Underlying();
  });
}
