import { expect } from "chai";

import { GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeGetLiquidateBorrowAllowed(): void {
  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getLiquidateBorrowAllowed(this.stubs.fyToken.address)).to.be.revertedWith(
        GenericErrors.BondNotListed,
      );
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
    });

    it("retrieves the default value", async function () {
      const liquidateBorrowAllowed: boolean = await this.contracts.fintroller.getLiquidateBorrowAllowed(
        this.stubs.fyToken.address,
      );
      expect(liquidateBorrowAllowed).to.equal(true);
    });
  });
}
