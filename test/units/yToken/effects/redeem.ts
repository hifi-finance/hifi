import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { OneHundredTokens, YTokenConstants } from "../../../helpers/constants";
import { YTokenErrors } from "../../../helpers/errors";
import { contextForTimeDependentTests } from "../../../helpers/mochaContexts";
import { increaseTime } from "../../../helpers/jsonRpcHelpers";

export default function shouldBehaveLikeRedeem() {
  contextForTimeDependentTests("when the bond matured", function () {
    beforeEach(async function () {
      await increaseTime(YTokenConstants.DefaultExpirationTime);
    });

    // describe("when the amount to redeem is not zero", function() {
    //   describe("when the fintroller allows redemptions", function() {
    //     beforeEach(async function() {

    //     });
    //   });
    // });

    describe("when the amount to redeem is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.lucy).redeem(Zero)).to.be.revertedWith(
          YTokenErrors.RedeemZero,
        );
      });
    });
  });

  describe("when the bond did not mature", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.lucy).redeem(OneHundredTokens)).to.be.revertedWith(
        YTokenErrors.BondNotMatured,
      );
    });
  });
}
