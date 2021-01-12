import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { HifiFlashSwapErrors } from "../../../../helpers/errors";
import { oraclePrecision, ten, usdcConstants, wbtcConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeUniswapV2Call(): void {
  describe("when the caller is the Uniswap V2 pair", function () {
    beforeEach(async function () {
      // Set the oracle price to 1 WBTC = $20,000.
      const p20k: BigNumber = BigNumber.from(20000).mul(ten.pow(oraclePrecision));
      await this.contracts.oracle.setWbtcPrice(p20k);

      // Set the oracle price to 1 USDC = $1.
      const p1: BigNumber = BigNumber.from(1).mul(ten.pow(oraclePrecision));
      await this.contracts.oracle.setUsdcPrice(p1);

      // Mint 100 WBTC to the pool.
      const wbtc10: BigNumber = BigNumber.from(100).mul(ten.pow(wbtcConstants.decimals));
      await this.contracts.wbtc.mint(this.contracts.uniswapV2Pair.address, wbtc10);

      // Mint 2,000,000 USDC to the pool.
      const usdc2m: BigNumber = BigNumber.from(2000000).mul(ten.pow(usdcConstants.decimals));
      await this.contracts.usdc.mint(this.contracts.uniswapV2Pair.address, usdc2m);

      // Call "sync" on the Uniswap V2 Pair to synchronise the token reserves. The price should now be the same
      // as the one recorded in the oracle (1 WBTC = $20,000).
      await this.contracts.uniswapV2Pair.sync();
    });

    describe("when the amount0 is non-zero", function () {
      const amount0: BigNumber = BigNumber.from(1);

      it("reverts", async function () {
        const amount1: BigNumber = BigNumber.from(20000);
        const data = "0xcafe";
        await expect(
          this.contracts.uniswapV2Pair
            .connect(this.signers.raider)
            .swap(amount0, amount1, this.contracts.hifiFlashSwap.address, data),
        ).to.be.revertedWith(HifiFlashSwapErrors.Token0AmountZero);
      });
    });
  });

  describe("when the caller is not the Uniswap V2 pair", function () {
    it("reverts", async function () {
      const sender: string = this.signers.raider.address;
      const amount0: BigNumber = Zero;
      const amount1: BigNumber = BigNumber.from(20000);
      await expect(
        this.contracts.hifiFlashSwap.connect(this.signers.raider).uniswapV2Call(sender, amount0, amount1, "0x"),
      ).to.be.revertedWith(HifiFlashSwapErrors.CallerNotUniswapV2Pair);
    });
  });
}
