import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeMintAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.fintroller.connect(this.admin).listBond(this.yToken.address);
    });

    it("retrieves the mint allowed state", async function () {
      const mintAllowed: boolean = await this.fintroller.mintAllowed(this.yToken.address);
      expect(mintAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.fintroller.connect(this.admin).mintAllowed(this.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
