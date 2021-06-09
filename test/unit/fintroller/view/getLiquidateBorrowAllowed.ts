import { expect } from "chai";

import { GenericErrors } from "../../../shared/errors";

export default function shouldBehaveLikeGetLiquidateBorrowAllowed(): void {
  context("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.getLiquidateBorrowAllowed(this.mocks.hTokens[0].address),
      ).to.be.revertedWith(GenericErrors.BondNotListed);
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
    });

    it("retrieves the default value", async function () {
      const liquidateBorrowAllowed: boolean = await this.contracts.fintroller.getLiquidateBorrowAllowed(
        this.mocks.hTokens[0].address,
      );
      expect(liquidateBorrowAllowed).to.equal(true);
    });
  });
}
