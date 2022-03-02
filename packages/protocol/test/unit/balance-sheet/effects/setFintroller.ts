import { AddressZero } from "@ethersproject/constants";
import { BalanceSheetErrors, OwnableUpgradeableErrors } from "@hifi/errors";
import { expect } from "chai";
import { MockContract } from "ethereum-waffle";

import { deployMockFintroller } from "../../../shared/mocks";

export function shouldBehaveLikeSetFintroller(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.connect(this.signers.raider).setFintroller(AddressZero),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when the Fintroller contract is the zero address", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.admin).setFintroller(AddressZero),
        ).to.be.revertedWith(BalanceSheetErrors.FINTROLLER_ZERO_ADDRESS);
      });
    });

    context("when the Fintroller contract is not the zero address", function () {
      let newFintroller: MockContract;

      beforeEach(async function () {
        newFintroller = await deployMockFintroller(this.signers.admin);
      });

      it("sets the new Fintroller contract", async function () {
        await this.contracts.balanceSheet.connect(this.signers.admin).setFintroller(newFintroller.address);
        const fintroller: string = await this.contracts.balanceSheet.fintroller();
        expect(fintroller).to.equal(newFintroller.address);
      });

      it("emits a SetFintroller event", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.admin).setFintroller(newFintroller.address))
          .to.emit(this.contracts.balanceSheet, "SetFintroller")
          .withArgs(this.signers.admin.address, this.mocks.fintroller.address, newFintroller.address);
      });
    });
  });
}
