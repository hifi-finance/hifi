import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeMintAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the mint allowed state", async function () {
      const mintAllowed: boolean = await this.contracts.fintroller.mintAllowed(this.stubs.yToken.address);
      expect(mintAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.admin).mintAllowed(this.stubs.yToken.address),
      ).to.be.revertedWith(FintrollerErrors.BondNotListed);
    });
  });
}
