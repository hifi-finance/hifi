import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeFlashUniswapV3 } from "./FlashUniswapV3.behavior";

export function integrationTestFlashUniswapV3(): void {
  describe("FlashUniswapV3", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        fintroller,
        flashUniswapV3,
        hToken,
        maliciousV3Pool,
        oracle,
        poolAddress,
        uniswapV3Pool,
        usdc,
        usdcPriceFeed,
        wbtc,
        wbtcPriceFeed,
        nonfungiblePositionManager,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.fintroller = fintroller;
      this.contracts.flashUniswapV3 = flashUniswapV3;
      this.contracts.hToken = hToken;
      this.contracts.maliciousV3Pool = maliciousV3Pool;
      this.contracts.oracle = oracle;
      this.contracts.poolAddress = poolAddress;
      this.contracts.uniswapV3Pool = uniswapV3Pool;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
      this.contracts.nonfungiblePositionManager = nonfungiblePositionManager;
    });

    shouldBehaveLikeFlashUniswapV3();
  });
}
