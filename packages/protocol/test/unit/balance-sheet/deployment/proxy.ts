import type { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import type { BalanceSheetUpgraded } from "../../../../src/types/contracts/test/BalanceSheetUpgraded.sol/BalanceSheetUpgraded";
import type { BalanceSheetUpgraded__factory } from "../../../../src/types/factories/contracts/test/BalanceSheetUpgraded.sol/BalanceSheetUpgraded__factory";

export function shouldBehaveLikeUpgradeableProxy(): void {
  let balanceSheetUpgraded: BalanceSheetUpgraded;

  beforeEach(async function () {
    const proxyAddress = this.contracts.balanceSheet.address;
    const balanceSheetUpgradedFactory: BalanceSheetUpgraded__factory = await ethers.getContractFactory(
      "BalanceSheetUpgraded",
    );
    balanceSheetUpgraded = <BalanceSheetUpgraded>await upgrades.upgradeProxy(
      proxyAddress,
      balanceSheetUpgradedFactory,
      {
        call: { args: [], fn: "setLastBlockNumber" },
      },
    );
  });

  context("when the BalanceSheet is upgraded", function () {
    it("doesn't break the previous storage vars", async function () {
      const oracleAddress: string = await this.contracts.balanceSheet.oracle();
      expect(oracleAddress).to.equal(this.mocks.oracle.address);
    });

    it("can use the new functions and storage vars", async function () {
      await balanceSheetUpgraded.setLastBlockNumber();
      const lastBlockNumber: BigNumber = await balanceSheetUpgraded.getLastBlockNumber();
      const currentBlockNumber: number = await ethers.provider.getBlockNumber();
      expect(lastBlockNumber).to.equal(currentBlockNumber);
    });
  });
}
