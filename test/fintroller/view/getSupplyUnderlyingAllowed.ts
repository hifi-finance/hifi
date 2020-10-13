import { expect } from "chai";

import { FintrollerErrors } from "../../../utils/errors";

export default function shouldBehaveLikeGetSupplyUnderlyingAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the default value", async function () {
      const supplyUnderlyingAllowed: boolean = await this.contracts.fintroller.getSupplyUnderlyingAllowed(
        this.stubs.yToken.address,
      );
      expect(supplyUnderlyingAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getSupplyUnderlyingAllowed(this.stubs.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
