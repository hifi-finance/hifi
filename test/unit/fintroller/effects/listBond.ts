import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeListBond(): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).listBond(this.stubs.fyToken.address),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the contract to be listed is non-compliant", function () {
      beforeEach(async function () {
        await this.stubs.fyToken.mock.isFyToken.returns(false);
      });

      it("rejects", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address),
        ).to.be.revertedWith(FintrollerErrors.ListBondFyTokenInspection);
      });
    });

    describe("when the contract to be listed is compliant", function () {
      it("lists the bond", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
        const bond = await this.contracts.fintroller.getBond(this.stubs.fyToken.address);
        expect(bond.isListed).to.equal(true);
      });

      it("emits a ListBond event", async function () {
        await expect(this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address))
          .to.emit(this.contracts.fintroller, "ListBond")
          .withArgs(this.signers.admin.address, this.stubs.fyToken.address);
      });
    });
  });
}
