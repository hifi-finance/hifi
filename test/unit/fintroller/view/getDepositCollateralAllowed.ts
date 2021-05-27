import { expect } from "chai";

import { GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeDepositCollateralAllowed(): void {
  context("when the bond is not listed", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.getDepositCollateralAllowed(this.stubs.hToken.address)).to.be.revertedWith(
        GenericErrors.BondNotListed,
      );
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
    });

    it("retrieves the default value", async function () {
      const depositCollateralAllowed: boolean = await this.contracts.fintroller.getDepositCollateralAllowed(
        this.stubs.hToken.address,
      );
      expect(depositCollateralAllowed).to.equal(true);
    });
  });
}
