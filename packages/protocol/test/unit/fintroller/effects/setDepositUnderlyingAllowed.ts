import { FintrollerErrors, OwnableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeSetDepositUnderlyingAllowed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setDepositUnderlyingAllowed(this.mocks.wbtc.address, true),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setDepositUnderlyingAllowed(this.mocks.wbtc.address, true),
        ).to.be.revertedWith(FintrollerErrors.BOND_NOT_LISTED);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.wbtc.address);
      });

      it("sets the value to true", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setDepositUnderlyingAllowed(this.mocks.wbtc.address, true);
        const newState: boolean = await this.contracts.fintroller.getDepositUnderlyingAllowed(this.mocks.wbtc.address);
        expect(newState).to.equal(true);
      });

      it("sets the value to false", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setDepositUnderlyingAllowed(this.mocks.wbtc.address, false);
        const newState: boolean = await this.contracts.fintroller.getDepositUnderlyingAllowed(this.mocks.wbtc.address);
        expect(newState).to.equal(false);
      });

      it("emits a SetDepositUnderlyingAllowed event", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setDepositUnderlyingAllowed(this.mocks.wbtc.address, true),
        )
          .to.emit(this.contracts.fintroller, "SetDepositUnderlyingAllowed")
          .withArgs(this.signers.admin.address, this.mocks.wbtc.address, true);
      });
    });
  });
}
