import { MockContract } from "@ethereum-waffle/mock-contract";
import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, BalanceSheetErrors } from "../../../shared/errors";
import { deployMockChainlinkOperator } from "../../../shared/mocks";

export default function shouldBehaveLikeSetOracle(): void {
  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.contracts.balanceSheet.connect(this.signers.raider).setOracle(AddressZero)).to.be.revertedWith(
        AdminErrors.NotAdmin,
      );
    });
  });

  context("when the caller is the admin", function () {
    context("when oracle address is not the zero address", function () {
      let newOracle: MockContract;

      beforeEach(async function () {
        newOracle = await deployMockChainlinkOperator(this.signers.admin);
      });

      it("sets the new oracle", async function () {
        await this.contracts.balanceSheet.connect(this.signers.admin).setOracle(newOracle.address);
        const oracle: string = await this.contracts.balanceSheet.oracle();
        expect(oracle).to.equal(newOracle.address);
      });

      it("emits a SetOracle event", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.admin).setOracle(newOracle.address))
          .to.emit(this.contracts.balanceSheet, "SetOracle")
          .withArgs(this.signers.admin.address, this.mocks.oracle.address, newOracle.address);
      });
    });

    context("when the oracle address is the zero address", function () {
      it("reverts", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.admin).setOracle(AddressZero)).to.be.revertedWith(
          BalanceSheetErrors.SetOracleZeroAddress,
        );
      });
    });
  });
}
