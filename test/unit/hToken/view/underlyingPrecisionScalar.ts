import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { H_TOKEN_EXPIRATION_TIMES } from "../../../../helpers/constants";
import { bn, precisionScalarForDecimals } from "../../../../helpers/numbers";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../shared/deployers";

export default function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  context("when the underlying has 6 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("6"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.owner,
        H_TOKEN_EXPIRATION_TIMES[0],
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalarForDecimals(bn("6")));
    });
  });

  context("when the underlying has 8 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("8"));
    });

    it("retrieves 1.0e10", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.owner,
        H_TOKEN_EXPIRATION_TIMES[0],
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalarForDecimals(bn("8")));
    });
  });

  context("when the underlying has 18 decimals", function () {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(bn("18"));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.owner,
        H_TOKEN_EXPIRATION_TIMES[0],
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(precisionScalarForDecimals(bn("18")));
    });
  });
}
