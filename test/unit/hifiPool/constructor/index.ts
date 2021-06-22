import { expect } from "chai";
import { Contract } from "ethers";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { HIFI_POOL_NAME, HIFI_POOL_SYMBOL } from "../../../../helpers/constants";
import { bn } from "../../../../helpers/numbers";

const { deployContract } = hre.waffle;

async function deployHifiPool(this: Mocha.Context): Promise<Contract> {
  const hifiPoolArtifact: Artifact = await hre.artifacts.readArtifact("HifiPool");
  return deployContract(this.signers.admin, hifiPoolArtifact, [
    HIFI_POOL_NAME,
    HIFI_POOL_SYMBOL,
    this.mocks.hToken.address,
    this.mocks.underlying.address,
  ]);
}

export default function shouldBehaveLikeConstructor(): void {
  context("when the underlying has 0 decimals", function () {
    beforeEach(async function () {
      await this.mocks.underlying.mock.decimals.returns(bn("0"));
    });

    it("reverts", async function () {
      const deployHifiPoolPromise: Promise<Contract> = deployHifiPool.call(this);
      await expect(deployHifiPoolPromise).to.be.revertedWith("HifiPool: 0 decimals underlying");
    });
  });

  context("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.mocks.underlying.mock.decimals.returns(bn("36"));
    });

    it("reverts", async function () {
      const deployHifiPoolPromise: Promise<Contract> = deployHifiPool.call(this);
      await expect(deployHifiPoolPromise).to.be.revertedWith("HifiPool: >18 decimals underlying");
    });
  });
}
