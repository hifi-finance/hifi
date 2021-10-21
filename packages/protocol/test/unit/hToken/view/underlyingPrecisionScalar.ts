import type { BigNumber } from "@ethersproject/bignumber";
import { H_TOKEN_MATURITY_THREE_MONTHS } from "@hifi/constants";
import { getPrecisionScalar } from "@hifi/helpers";
import { expect } from "chai";

import type { HToken } from "../../../../src/types/HToken";
import { deployHToken } from "../../../shared/deployers";

export function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  context("when the underlying has 18 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(18);
    });

    it("returns 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(18));
    });
  });

  context("when the underlying has 6 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(6);
    });

    it("returns 1.e12", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(6));
    });
  });

  context("when the underlying has 1 decimal", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(1);
    });

    it("returns 1.e17", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(1));
    });
  });
}
