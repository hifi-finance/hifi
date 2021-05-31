import { expect } from "chai";

import { AdminErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeListBond(): void {
  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).listBond(this.mocks.hTokens[0].address),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    it("lists the bond", async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
      const bond = await this.contracts.fintroller.getBond(this.mocks.hTokens[0].address);
      expect(bond.isListed).to.equal(true);
    });

    it("emits a ListBond event", async function () {
      await expect(this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address))
        .to.emit(this.contracts.fintroller, "ListBond")
        .withArgs(this.signers.admin.address, this.mocks.hTokens[0].address);
    });
  });
}
