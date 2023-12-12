import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeFlashUniswapV3 } from "./FlashUniswapV3.behavior";

export function integrationTestFlashUniswapV3(): void {
  describe("FlashUniswapV3", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        dai,
        fintroller,
        flashUniswapV3,
        hToken,
        uniswapV3PositionManager,
        usdc,
        usdcPriceFeed,
        wbtc,
        wbtcPriceFeed,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.dai = dai;
      this.contracts.fintroller = fintroller;
      this.contracts.flashUniswapV3 = flashUniswapV3;
      this.contracts.hToken = hToken;
      this.contracts.uniswapV3PositionManager = uniswapV3PositionManager;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeFlashUniswapV3();
  });
}
