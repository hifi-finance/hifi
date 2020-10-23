import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256, Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { CollateralConstants, OpenPriceFeedPrecisionScalar, Prices } from "../../../../helpers/constants";
import { OraclePriceUtilsErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeGetAdjustedPrice(): void {
  /* We are not using "ETH" here because we're not mocking the oracle itself. */
  const collateralSymbol = CollateralConstants.Symbol;

  describe("when the oracle does not have price data for the symbol", function () {
    const unavailableSymbol: string = "HEX";

    beforeEach(async function () {
      await this.stubs.oracle.mock.price.withArgs(unavailableSymbol).returns(Zero);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.oraclePriceUtils.testGetAdjustedPrice(unavailableSymbol, OpenPriceFeedPrecisionScalar),
      ).to.be.revertedWith(OraclePriceUtilsErrors.PriceZero);
    });
  });

  describe("when the oracle has price data for the symbol", function () {
    describe("when the precision scalar multiplication overflows", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.oraclePriceUtils.testGetAdjustedPrice(collateralSymbol, MaxUint256),
        ).to.be.revertedWith(OraclePriceUtilsErrors.MathError);
      });
    });

    describe("when the precision scalar multiplication does not overflow", function () {
      it("retrieves the scaled price", async function () {
        const adjustedPrice: BigNumber = await this.contracts.oraclePriceUtils.testGetAdjustedPrice(
          collateralSymbol,
          OpenPriceFeedPrecisionScalar,
        );
        expect(adjustedPrice).to.equal(Prices.OneHundredDollars.mul(OpenPriceFeedPrecisionScalar));
      });
    });
  });
}
