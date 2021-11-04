import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeCollateralFlashUniswapV2 } from "./CollateralFlashUniswapV2.behavior";

export function integrationTestCollateralFlashUniswapV2(): void {
  describe("CollateralFlashUniswapV2", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        fintroller,
        hToken,
        collateralFlashUniswapV2,
        maliciousPair,
        oracle,
        underlyingFlashUniswapV2,
        uniswapV2Pair,
        usdc,
        usdcPriceFeed,
        wbtc,
        wbtcPriceFeed,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.fintroller = fintroller;
      this.contracts.hToken = hToken;
      this.contracts.collateralFlashUniswapV2 = collateralFlashUniswapV2;
      this.contracts.maliciousPair = maliciousPair;
      this.contracts.oracle = oracle;
      this.contracts.underlyingFlashUniswapV2 = underlyingFlashUniswapV2;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.uniswapV2Pair = uniswapV2Pair;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeCollateralFlashUniswapV2();
  });
}
