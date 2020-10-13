import { expect } from "chai";

import { FintrollerErrors } from "../../../utils/errors";

export default function shouldBehaveLikeGetRedeemUnderlyingAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the default value", async function () {
      const redeemUnderlyingAllowed: boolean = await this.contracts.fintroller.getRedeemUnderlyingAllowed(
        this.stubs.yToken.address,
      );
      expect(redeemUnderlyingAllowed).to.equal(true);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getRedeemUnderlyingAllowed(this.stubs.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
