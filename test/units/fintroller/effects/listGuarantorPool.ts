import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeListGuarantorPool(): void {
  describe("when the caller is the admin", function () {
    describe("when the contract to be listed is compliant", function () {
      it("lists the pool", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listGuarantorPool(this.stubs.guarantorPool.address);
      });

      it("emits a ListGuarantorPool event", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).listGuarantorPool(this.stubs.guarantorPool.address),
        )
          .to.emit(this.contracts.fintroller, "ListGuarantorPool")
          .withArgs(this.accounts.admin, this.stubs.guarantorPool.address);
      });
    });

    describe("when the contract to be listed is non-compliant", function () {
      it("rejects", async function () {
        await expect(this.contracts.fintroller.connect(this.signers.admin).listGuarantorPool(AddressZero)).to.be
          .reverted;
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.eve).listGuarantorPool(this.stubs.yToken.address),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });
}
