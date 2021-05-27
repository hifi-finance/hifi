import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { hTokenConstants, precisionScalars } from "../../../../helpers/constants";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../deployers";

export default function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  context("when the underlying has 6 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(BigNumber.from(6));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalars.tokenWith6Decimals);
    });
  });

  context("when the underlying has 8 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(BigNumber.from(8));
    });

    it("retrieves 1.0e10", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalars.tokenWith8Decimals);
    });
  });

  context("when the underlying has 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(BigNumber.from(18));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalars.tokenWith18Decimals);
    });
  });
}
