import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { Errors } from "../../../dev-utils/errors";

export default function shouldBehaveLikeListBond(): void {
  describe("when the caller is the admin", function () {
    describe("when the contract to be listed is compliant", function () {
      it("lists the new bond", async function () {
        await this.fintroller.connect(this.admin).listBond(this.yToken.address);
      });

      it("emits a ListBond event", async function () {
        await expect(this.fintroller.connect(this.admin).listBond(this.yToken.address))
          .to.emit(this.fintroller, "ListBond")
          .withArgs(this.yToken.address);
      });
    });

    describe("when the contract to be listed is non-compliant", function () {
      it("rejects", async function () {
        await expect(this.fintroller.connect(this.admin).listBond(AddressZero)).to.be.reverted;
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.fintroller.connect(this.eve).listBond(this.yToken.address)).to.be.revertedWith(
        Errors.NotAuthorized,
      );
    });
  });
}
