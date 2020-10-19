import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256, Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { CollateralConstants, OpenPriceFeedPrecisionScalar, Prices } from "../../../../helpers/constants";
import { OraclePriceScalarErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeGetScaledPrice(): void {
  const collateralSymbol = CollateralConstants.Symbol;

  describe("when the oracle has price data for the symbol", function () {
    describe("when the precision scalar multiplication does not overflow", function () {
      it("retrieves the scaled price", async function () {
        const scaledPrice: BigNumber = await this.contracts.oraclePriceScalar.testGetScaledPrice(
          collateralSymbol,
          OpenPriceFeedPrecisionScalar,
        );
        expect(scaledPrice).to.equal(Prices.OneHundredDollars.mul(OpenPriceFeedPrecisionScalar));
      });
    });

    describe("when the precision scalar multiplication overflows", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.oraclePriceScalar.testGetScaledPrice(collateralSymbol, MaxUint256),
        ).to.be.revertedWith(OraclePriceScalarErrors.MathError);
      });
    });
  });

  describe("when the oracle does not have price data for the symbol", function () {
    const unavailableSymbol: string = "HEX";

    beforeEach(async function () {
      await this.stubs.oracle.mock.price.withArgs(unavailableSymbol).returns(Zero);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.oraclePriceScalar.testGetScaledPrice(unavailableSymbol, OpenPriceFeedPrecisionScalar),
      ).to.be.revertedWith(OraclePriceScalarErrors.GetScaledPriceZero);
    });
  });
}
