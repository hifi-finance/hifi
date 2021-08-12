import { expect } from "chai";

import { HifiPoolRegistryErrors, OwnableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeTrackPool(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hifiPoolRegistry.connect(this.signers.alice).trackPool(this.mocks.hifiPool.address),
      ).to.be.revertedWith(OwnableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the pool is already tracked", function () {
      beforeEach(async function () {
        await this.contracts.hifiPoolRegistry.connect(this.signers.admin).trackPool(this.mocks.hifiPool.address);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.hifiPoolRegistry.connect(this.signers.admin).trackPool(this.mocks.hifiPool.address),
        ).to.be.revertedWith(HifiPoolRegistryErrors.PoolAlreadyTracked);
      });
    });

    context("when the pool is not already tracked", function () {
      it("tracks the new pool", async function () {
        await expect(this.contracts.hifiPoolRegistry.connect(this.signers.admin).trackPool(this.mocks.hifiPool.address))
          .to.emit(this.contracts.hifiPoolRegistry, "TrackPool")
          .withArgs(this.mocks.hifiPool.address);

        expect(await this.contracts.hifiPoolRegistry.pools(this.mocks.hifiPool.address)).to.be.equal(true);
      });
    });
  });
}
