import { BigNumber } from "@ethersproject/bignumber";
import { H_TOKEN_MATURITY_THREE_MONTHS } from "@hifi/constants";
import { bn, getPrecisionScalar } from "@hifi/helpers";
import { expect } from "chai";

import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../shared/deployers";

export default function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  context("when the underlying has 6 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("6"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(bn("6")));
    });
  });

  context("when the underlying has 8 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("8"));
    });

    it("retrieves 1.0e10", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(bn("8")));
    });
  });

  context("when the underlying has 18 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("18"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(bn("18")));
    });
  });
}
