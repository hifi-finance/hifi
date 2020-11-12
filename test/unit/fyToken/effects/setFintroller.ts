import { AddressZero } from "@ethersproject/constants";
import { MockContract } from "ethereum-waffle";
import { expect } from "chai";

import { AdminErrors, FyTokenErrors } from "../../../../helpers/errors";
import { deployStubFintroller } from "../../stubs";

export default function shouldBehaveLikeSetFintroller(): void {
  describe("when the caller is not the administrator", function () {
    it("reverts", async function () {
      await expect(this.contracts.fyToken.connect(this.signers.raider)._setFintroller(AddressZero)).to.be.revertedWith(
        AdminErrors.NotAdmin,
      );
    });
  });

  describe("when the caller is the administrator", function () {
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
          this.contracts.fyToken.connect(this.signers.admin)._setFintroller(newFintroller.address),
        ).to.be.revertedWith(FyTokenErrors.SetFintrollerInspection);
      });
    });

    describe("when the new Fintroller is compliant", function () {
      beforeEach(async function () {
        await newFintroller.mock.isFintroller.returns(true);
      });

      it("sets the new Fintroller", async function () {
        await this.contracts.fyToken.connect(this.signers.admin)._setFintroller(newFintroller.address);
        const newFintrollerAddress: string = await this.contracts.fyToken.fintroller();
        expect(newFintroller.address).to.equal(newFintrollerAddress);
      });
    });
  });
}
