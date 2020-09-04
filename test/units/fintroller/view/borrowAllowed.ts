import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeBorrowAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the borrowAllowed state", async function () {
      const borrowAllowed: boolean = await this.contracts.fintroller.borrowAllowed(this.stubs.yToken.address);
      expect(borrowAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.admin).borrowAllowed(this.stubs.yToken.address),
      ).to.be.revertedWith(FintrollerErrors.BondNotListed);
    });
  });
}
