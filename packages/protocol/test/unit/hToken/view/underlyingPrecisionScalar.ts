import type { BigNumber } from "@ethersproject/bignumber";
import { H_TOKEN_MATURITY_THREE_MONTHS } from "@hifi/constants";
import { getPrecisionScalar } from "@hifi/helpers";
import { expect } from "chai";
import forEach from "mocha-each";

import type { HToken } from "../../../../src/types/HToken";
import { deployHToken } from "../../../shared/deployers";

export function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  const testSets: number[] = [18, 6, 1];

  forEach(testSets).describe("when the underlying has %d decimals", function (decimals: number) {
    beforeEach(async function () {
      await this.mocks.usdc.mock.decimals.returns(decimals);
    });

    it("returns the correct precision scalar", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        H_TOKEN_MATURITY_THREE_MONTHS,
        this.mocks.balanceSheet.address,
        this.mocks.usdc.address,
      );
      const underlyingPrecisionScalar: BigNumber = await hToken.underlyingPrecisionScalar();
      expect(underlyingPrecisionScalar).to.equal(getPrecisionScalar(decimals));
    });
  });
}
