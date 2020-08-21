import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeDepositAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the deposit allowed state", async function () {
      const depositAllowed: boolean = await this.contracts.fintroller.depositAllowed(this.stubs.yToken.address);
      expect(depositAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.admin).depositAllowed(this.stubs.yToken.address),
      ).to.be.revertedWith(FintrollerErrors.BondNotListed);
    });
  });
}
