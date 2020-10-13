import { expect } from "chai";

import { FintrollerErrors } from "../../../utils/errors";

export default function shouldBehaveLikeGetLiquidateBorrowAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the default value", async function () {
      const liquidateBorrowAllowed: boolean = await this.contracts.fintroller.getLiquidateBorrowAllowed(
        this.stubs.yToken.address,
      );
      expect(liquidateBorrowAllowed).to.equal(true);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getLiquidateBorrowAllowed(this.stubs.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
