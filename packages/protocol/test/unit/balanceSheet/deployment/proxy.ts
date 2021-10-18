import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import { BalanceSheetV2__factory } from "../../../../src/types";
import { BalanceSheetV2 } from "../../../../src/types/BalanceSheetV2";

export function shouldBehaveLikeUpgradeableProxy(): void {
  let balanceSheetV2: BalanceSheetV2;

  beforeEach(async function () {
    const proxyAddress = this.contracts.balanceSheet.address;
    const balanceSheetV2Factory: BalanceSheetV2__factory = await ethers.getContractFactory("BalanceSheetV2");
    balanceSheetV2 = <BalanceSheetV2>await upgrades.upgradeProxy(proxyAddress, balanceSheetV2Factory);
  });

  context("when the Fintroller implementation is upgraded", function () {
    it("doesn't break the previous storage vars", async function () {
      const oracleAddress: string = await this.contracts.balanceSheet.oracle();
      expect(oracleAddress).to.equal(this.mocks.oracle.address);
    });

    it("can use the new functions and storage vars", async function () {
      await balanceSheetV2.setLastBlockNumber();
      const lastBlockNumber: BigNumber = await balanceSheetV2.getLastBlockNumber();
      const currentBlockNumber: number = await ethers.provider.getBlockNumber();
      expect(lastBlockNumber).to.equal(currentBlockNumber);
    });
  });
}
