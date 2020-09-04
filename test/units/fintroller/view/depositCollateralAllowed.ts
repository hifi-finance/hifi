import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeDepositCollateralAllowed(): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
    });

    it("retrieves the depositAllowed state", async function () {
      const depositCollateralAllowed: boolean = await this.contracts.fintroller.depositCollateralAllowed(
        this.stubs.yToken.address,
      );
      expect(depositCollateralAllowed).to.equal(false);
    });
  });

  describe("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.admin).depositCollateralAllowed(this.stubs.yToken.address),
      ).to.be.revertedWith(FintrollerErrors.BondNotListed);
    });
  });
}
