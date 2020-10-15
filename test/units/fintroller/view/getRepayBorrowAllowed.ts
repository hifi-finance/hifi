import { expect } from "chai";

import { FintrollerErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeGetRepayBorrowAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the default value", async function () {
      const repayBorrowAllowed: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(
        this.stubs.yToken.address,
      );
      expect(repayBorrowAllowed).to.equal(true);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getRepayBorrowAllowed(this.stubs.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
