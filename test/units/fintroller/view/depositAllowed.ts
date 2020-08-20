import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeDepositAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.fintroller.connect(this.admin).listBond(this.yToken.address);
    });

    it("retrieves the deposit allowed state", async function () {
      const depositAllowed: boolean = await this.fintroller.depositAllowed(this.yToken.address);
      expect(depositAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.fintroller.connect(this.admin).depositAllowed(this.yToken.address)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
