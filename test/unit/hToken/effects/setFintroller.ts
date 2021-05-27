import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import { MockContract } from "ethereum-waffle";

import { AdminErrors, HTokenErrors } from "../../../../helpers/errors";
import { deployStubFintroller } from "../../stubs";

export default function shouldBehaveLikeSetFintroller(): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.contracts.hToken.connect(this.signers.raider)._setFintroller(AddressZero)).to.be.revertedWith(
        AdminErrors.NotAdmin,
      );
    });
  });

  describe("when the caller is the admin", function () {
    let newFintroller: MockContract;

    beforeEach(async function () {
      newFintroller = await deployStubFintroller(this.signers.admin);
    });

    describe("when the new Fintroller is not compliant", function () {
      beforeEach(async function () {
        await newFintroller.mock.isFintroller.returns(false);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.hToken.connect(this.signers.admin)._setFintroller(newFintroller.address),
        ).to.be.revertedWith(HTokenErrors.SetFintrollerInspection);
      });
    });

    describe("when the new Fintroller is compliant", function () {
      beforeEach(async function () {
        await newFintroller.mock.isFintroller.returns(true);
      });

      it("sets the new Fintroller", async function () {
        await this.contracts.hToken.connect(this.signers.admin)._setFintroller(newFintroller.address);
        const newFintrollerAddress: string = await this.contracts.hToken.fintroller();
        expect(newFintroller.address).to.equal(newFintrollerAddress);
      });
    });
  });
}
