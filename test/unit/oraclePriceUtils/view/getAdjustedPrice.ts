import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256, Zero } from "@ethersproject/constants";
import { expect } from "chai";

import scenarios from "../../../scenarios";

import { OraclePriceUtilsErrors } from "../../../../helpers/errors";
import { openPriceFeedPrecisionScalar } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetAdjustedPrice(): void {
  /* We are not using "ETH" here because we're not mocking the oracle itself. */
  const collateralSymbol = scenarios.local.collateral.symbol;

  describe("when the oracle does not have price data for the symbol", function () {
    const unavailableSymbol: string = "HEX";

    beforeEach(async function () {
      await this.stubs.oracle.mock.price.withArgs(unavailableSymbol).returns(Zero);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.oraclePriceUtils.testGetAdjustedPrice(unavailableSymbol, openPriceFeedPrecisionScalar),
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
      it("retrieves the adjusted price", async function () {
        const collateralPrice: BigNumber = scenarios.local.oracle.prices.collateral;
        const adjustedPrice: BigNumber = await this.contracts.oraclePriceUtils.testGetAdjustedPrice(
          collateralSymbol,
          openPriceFeedPrecisionScalar,
        );
        expect(adjustedPrice).to.equal(collateralPrice.mul(openPriceFeedPrecisionScalar));
      });
    });
  });
}
