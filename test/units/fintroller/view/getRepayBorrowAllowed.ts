import { expect } from "chai";

import { FintrollerErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeGetRepayBorrowAllowed(): void {
  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getRepayBorrowAllowed(this.stubs.fyToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
    });

    it("retrieves the default value", async function () {
      const repayBorrowAllowed: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(
        this.stubs.fyToken.address,
      );
      expect(repayBorrowAllowed).to.equal(true);
    });
  });
}
