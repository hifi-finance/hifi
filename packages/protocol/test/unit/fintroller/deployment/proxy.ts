import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import { DEFAULT_MAX_BONDS } from "@hifi/constants";
import type { FintrollerV2__factory } from "../../../../src/types";
import type { FintrollerV2 } from "../../../../src/types/FintrollerV2";

export function shouldBehaveLikeUpgradeableProxy(): void {
  let fintrollerV2: FintrollerV2;

  beforeEach(async function () {
    const v1Address = this.contracts.fintroller.address;
    const fintrollerV2Factory: FintrollerV2__factory = await ethers.getContractFactory("FintrollerV2");
    fintrollerV2 = <FintrollerV2>await upgrades.upgradeProxy(v1Address, fintrollerV2Factory);
  });

  context("when the Fintroller implementation is upgraded", function () {
    it("doesn't break the previous storage vars", async function () {
      const maxBonds: BigNumber = await fintrollerV2.maxBonds();
      expect(maxBonds).to.equal(DEFAULT_MAX_BONDS);
    });

    it("can use the new functions and storage vars", async function () {
      await fintrollerV2.setLastBlockNumber();
      const lastBlockNumber: BigNumber = await fintrollerV2.getLastBlockNumber();
      const currentBlockNumber: number = await ethers.provider.getBlockNumber();
      expect(lastBlockNumber).to.equal(currentBlockNumber);
    });
  });
}
