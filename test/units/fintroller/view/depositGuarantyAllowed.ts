import { expect } from "chai";

import { FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeDepositGuarantyAllowed(): void {
  describe("when the pool is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listGuarantorPool(this.stubs.guarantorPool.address);
    });

    it("retrieves the 'depositGuarantyAllowed' state", async function () {
      const depositGuarantyAllowed: boolean = await this.contracts.fintroller.depositGuarantyAllowed(
        this.stubs.guarantorPool.address,
      );
      expect(depositGuarantyAllowed).to.equal(false);
    });
  });

  describe("when the pool is not listed", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.depositGuarantyAllowed(this.stubs.guarantorPool.address),
      ).to.be.revertedWith(FintrollerErrors.GuarantorPoolNotListed);
    });
  });
}
