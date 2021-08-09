import {} from "../../../shared/errors";

import { expect } from "chai";

import { HifiPoolRegistryErrors } from "../../../shared/errors";

export default function shouldBehaveLikeUntrackPool(): void {
  context("when called to untrack a tracked pool", function () {
    beforeEach(async function () {
      await this.contracts.hifiPoolRegistry.connect(this.signers.admin).trackPool(this.mocks.hifiPool.address);
    });

    it("untracks pool", async function () {
      await expect(this.contracts.hifiPoolRegistry.connect(this.signers.admin).untrackPool(this.mocks.hifiPool.address))
        .to.emit(this.contracts.hifiPoolRegistry, "UntrackPool")
        .withArgs(this.mocks.hifiPool.address);
    });
  });

  context("when called to untrack an non-tracked pool", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hifiPoolRegistry.connect(this.signers.admin).untrackPool(this.mocks.hifiPool.address),
      ).to.be.revertedWith(HifiPoolRegistryErrors.PoolNotTracked);
    });
  });
}
