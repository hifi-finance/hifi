import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeRedeemAllowedGetter(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the redeemAllowed state", async function () {
      const redeemAllowed: boolean = await this.contracts.fintroller.redeemAllowed(this.stubs.yToken.address);
      expect(redeemAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.admin).redeemAllowed(this.stubs.yToken.address),
      ).to.be.revertedWith(FintrollerErrors.BondNotListed);
    });
  });
}
