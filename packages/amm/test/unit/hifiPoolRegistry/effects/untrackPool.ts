import { expect } from "chai";

import { HifiPoolRegistryErrors, OwnableErrors } from "../../../shared/errors";

export function shouldBehaveLikeUntrackPool(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hifiPoolRegistry.connect(this.signers.alice).untrackPool(this.mocks.hifiPool.address),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when pool is not already tracked", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.hifiPoolRegistry.connect(this.signers.admin).untrackPool(this.mocks.hifiPool.address),
        ).to.be.revertedWith(HifiPoolRegistryErrors.POOL_NOT_TRACKED);
      });
    });

    context("when the pool is already tracked", function () {
      beforeEach(async function () {
        await this.contracts.hifiPoolRegistry.connect(this.signers.admin).trackPool(this.mocks.hifiPool.address);
      });

      it("untracks pool", async function () {
        await expect(
          this.contracts.hifiPoolRegistry.connect(this.signers.admin).untrackPool(this.mocks.hifiPool.address),
        )
          .to.emit(this.contracts.hifiPoolRegistry, "UntrackPool")
          .withArgs(this.mocks.hifiPool.address);
      });
    });
  });
}
