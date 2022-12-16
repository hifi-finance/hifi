import { OwnableErrors } from "@hifi/errors";
import { getDaysInSeconds } from "@hifi/helpers";
import { expect } from "chai";

export function shouldBehaveLikeSetPriceStalenessThreshold(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.oracle.connect(this.signers.raider).setPriceStalenessThreshold(getDaysInSeconds(2)),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    it("sets the price staleness threshold", async function () {
      await this.contracts.oracle.connect(this.signers.admin).setPriceStalenessThreshold(getDaysInSeconds(2));
      const priceStalenessThreshold = await this.contracts.oracle.priceStalenessThreshold();
      expect(priceStalenessThreshold).to.equal(getDaysInSeconds(2));
    });

    it("emits a SetPriceStalenessThreshold event", async function () {
      await expect(this.contracts.oracle.connect(this.signers.admin).setPriceStalenessThreshold(getDaysInSeconds(2)))
        .to.emit(this.contracts.oracle, "SetPriceStalenessThreshold")
        .withArgs(getDaysInSeconds(1), getDaysInSeconds(2));
    });
  });
}
