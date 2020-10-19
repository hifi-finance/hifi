import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeListBond(): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).listBond(this.stubs.yToken.address),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the contract to be listed is non-compliant", function () {
      it("rejects", async function () {
        await expect(this.contracts.fintroller.connect(this.signers.admin).listBond(AddressZero)).to.be.reverted;
      });
    });

    describe("when the contract to be listed is compliant", function () {
      it("lists the bond", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
        const bond = await this.contracts.fintroller.getBond(this.stubs.yToken.address);
        expect(bond.isListed).to.equal(true);
      });

      it("emits a ListBond event", async function () {
        await expect(this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address))
          .to.emit(this.contracts.fintroller, "ListBond")
          .withArgs(this.accounts.admin, this.stubs.yToken.address);
      });
    });
  });
}
