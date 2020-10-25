import { expect } from "chai";

import { addressOne } from "../../../../helpers/constants";
import { AdminErrors } from "../../../../helpers/errors";
import { Fintroller } from "../../../../typechain/Fintroller";
import { deployFintroller } from "../../../deployers";

export default function shouldBehaveLikeSetFintroller(): void {
  describe("when the caller is not the administrator", function () {
    it("reverts", async function () {
      await expect(this.contracts.fyToken.connect(this.signers.raider)._setFintroller(addressOne)).to.be.revertedWith(
        AdminErrors.NotAdmin,
      );
    });
  });

  describe("when the caller is the administrator", function () {
    describe("when the new Fintroller is not compliant", function () {
      it("reverts", async function () {
        await expect(this.contracts.fyToken.connect(this.signers.admin)._setFintroller(addressOne)).to.be.reverted;
      });
    });

    describe("when the new Fintroller is compliant", function () {
      let newFintroller: Fintroller;

      beforeEach(async function () {
        newFintroller = await deployFintroller(this.signers.admin);
      });

      it("reverts", async function () {
        await this.contracts.fyToken.connect(this.signers.admin)._setFintroller(newFintroller.address);
        const newFintrollerAddress: string = await this.contracts.fyToken.fintroller();
        expect(newFintroller.address).to.equal(newFintrollerAddress);
      });
    });
  });
}
