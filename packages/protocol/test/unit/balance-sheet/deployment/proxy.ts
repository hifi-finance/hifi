import type { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import type { BalanceSheetV3__factory } from "../../../../src/types";
import type { BalanceSheetV3 } from "../../../../src/types/BalanceSheetV3";

export function shouldBehaveLikeUpgradeableProxy(): void {
  let balanceSheetV3: BalanceSheetV3;

  beforeEach(async function () {
    const proxyAddress = this.contracts.balanceSheet.address;
    const balanceSheetV3Factory: BalanceSheetV3__factory = await ethers.getContractFactory("BalanceSheetV3");
    balanceSheetV3 = <BalanceSheetV3>await upgrades.upgradeProxy(proxyAddress, balanceSheetV3Factory);
  });

  context("when the Fintroller implementation is upgraded", function () {
    it("doesn't break the previous storage vars", async function () {
      const oracleAddress: string = await this.contracts.balanceSheet.oracle();
      expect(oracleAddress).to.equal(this.mocks.oracle.address);
    });

    it("can use the new functions and storage vars", async function () {
      await balanceSheetV3.setLastBlockNumber();
      const lastBlockNumber: BigNumber = await balanceSheetV3.getLastBlockNumber();
      const currentBlockNumber: number = await ethers.provider.getBlockNumber();
      expect(lastBlockNumber).to.equal(currentBlockNumber);
    });
  });
}
