import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeRedeemUnderlyingAllowedGetter(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the redeemUnderlyingAllowed state", async function () {
      const redeemUnderlyingAllowed: boolean = await this.contracts.fintroller.redeemUnderlyingAllowed(
        this.stubs.yToken.address,
      );
      expect(redeemUnderlyingAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.redeemUnderlyingAllowed(this.stubs.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
