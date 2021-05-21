import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { Contract } from "ethers";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { bn } from "../../../../helpers/numbers";

const { deployContract } = hre.waffle;

async function deployHifiPool(this: Mocha.Context): Promise<Contract> {
  const hifiPoolArtifact: Artifact = await hre.artifacts.readArtifact("HifiPool");
  return deployContract(this.signers.admin, hifiPoolArtifact, [
    "Hifi USDC (2022-06-30) Pool",
    "hUSDCJun22LP",
    this.stubs.fyToken.address,
    this.stubs.underlying.address,
  ]);
}

export default function shouldBehaveLikeHifiPoolConstructor(): void {
  describe("when the underlying has 0 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(bn("0"));
    });

    it("reverts", async function () {
      const deployHifiPoolPromise: Promise<Contract> = deployHifiPool.call(this);
      await expect(deployHifiPoolPromise).to.be.revertedWith("HifiPool: 0 decimals underlying");
    });
  });

  describe("when the underlying has more than 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(bn("36"));
    });

    it("reverts", async function () {
      const deployHifiPoolPromise: Promise<Contract> = deployHifiPool.call(this);
      await expect(deployHifiPoolPromise).to.be.revertedWith("HifiPool: >18 decimals underlying");
    });
  });
}
