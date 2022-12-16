import { BigNumber } from "@ethersproject/bignumber";
import { DEFAULT_MAX_COLLATERALS } from "@hifi/constants";
import { OwnableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeSetMaxCollaterals(): void {
  const newMaxCollaterals: BigNumber = DEFAULT_MAX_COLLATERALS.add(1);

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).setMaxCollaterals(newMaxCollaterals),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    it("sets a new value", async function () {
      await this.contracts.fintroller.setMaxCollaterals(newMaxCollaterals);
      const maxCollaterals: BigNumber = await this.contracts.fintroller.maxCollaterals();
      expect(maxCollaterals).to.equal(newMaxCollaterals);
    });
  });
}
