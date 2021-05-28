import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { H_TOKEN_EXPIRATION_TIME } from "../../../../helpers/constants";
import { bn, precisionScalarForDecimals } from "../../../../helpers/numbers";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../deployers";

export default function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  context("when the underlying has 6 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(bn("6"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalarForDecimals(6));
    });
  });

  context("when the underlying has 8 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(bn("8"));
    });

    it("retrieves 1.0e10", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalarForDecimals(8));
    });
  });

  context("when the underlying has 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(bn("18"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_EXPIRATION_TIME,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalarForDecimals(18));
    });
  });
}
